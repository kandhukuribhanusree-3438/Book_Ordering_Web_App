(function() {
  'use strict';

  // Use relative API path in production, absolute in development
  const apiBase = window.API_BASE || '';
  const API_BASE = apiBase ? apiBase + '/api' : '/api';

  angular.module('booksApp', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', { templateUrl: 'user.tpl' })
        .when('/orders', { templateUrl: 'myorders.tpl' })
        .when('/admin', { templateUrl: 'admin.tpl' })
        .when('/login', { templateUrl: 'login.tpl' })
        .when('/register', { templateUrl: 'register.tpl' })
        .otherwise({ redirectTo: '/login' });
      $locationProvider.hashPrefix('');
    }])
    .factory('AuthService', ['$window', function($window) {
      const storageKey = 'books_token';
      const userKey = 'books_user';
      let cachedUser = null;
      function save(token, user) {
        $window.localStorage.setItem(storageKey, token);
        $window.localStorage.setItem(userKey, JSON.stringify(user));
        cachedUser = user;
      }
      function token() { return $window.localStorage.getItem(storageKey); }
      function user() {
        if (cachedUser) return cachedUser;
        const raw = $window.localStorage.getItem(userKey);
        return raw ? (cachedUser = JSON.parse(raw)) : null;
      }
      function isAuthenticated() { return !!token(); }
      function clear() {
        $window.localStorage.removeItem(storageKey);
        $window.localStorage.removeItem(userKey);
        cachedUser = null;
      }
      return { save, token, user, isAuthenticated, clear };
    }])
    .factory('AuthInterceptor', ['AuthService', function(AuthService) {
      return {
        request: function(config) {
          const t = AuthService.token();
          if (t) { config.headers = config.headers || {}; config.headers.Authorization = 'Bearer ' + t; }
          return config;
        }
      };
    }])
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
    }])
    .run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
      // expose auth to templates
      $rootScope.auth = {
        isAuthenticated: AuthService.isAuthenticated,
        user: AuthService.user,
        logout: function() { AuthService.clear(); $location.path('/login'); }
      };
      // Always apply dark theme
      document.body.classList.add('theme-dark');
      // route guard: enforce login and role access
      $rootScope.$on('$routeChangeStart', function(event, next) {
        const isAuthed = AuthService.isAuthenticated();
        const role = AuthService.user() && AuthService.user().role;
        const path = (next && next.originalPath) || '';
        if (!isAuthed && path !== '/login' && path !== '/register') {
          event.preventDefault(); $location.path('/login'); return;
        }
        if (path === '/admin' && role !== 'admin') { event.preventDefault(); $location.path('/'); return; }
        if ((path === '/' || path === '/orders') && role === 'admin') { event.preventDefault(); $location.path('/admin'); return; }
      });
    }])
    .controller('BooksController', ['$http', '$q', function($http, $q) {
      const vm = this;
      vm.loading = false;
      vm.error = '';
      vm.books = [];
      vm.cart = [];
      vm.total = 0;
      vm.customer = { name: '', email: '' };
      vm.placing = false;
      vm.success = null;
      vm.submitError = '';

      vm.fetchBooks = function() {
        vm.loading = true;
        vm.error = '';
        return $http.get(API_BASE + '/books')
          .then(function(res) { vm.books = res.data || []; })
          .catch(function() { vm.error = 'Failed to load books'; })
          .finally(function() { vm.loading = false; });
      };

      vm.addToCart = function(book) {
        const existing = vm.cart.find(function(i) { return i.bookId === book.id; });
        if (existing) {
          existing.quantity += 1;
        } else {
          vm.cart.push({ bookId: book.id, title: book.title, price: book.price, quantity: 1 });
        }
        vm.recalculate();
      };

      vm.removeFromCart = function(item) {
        vm.cart = vm.cart.filter(function(i) { return i.bookId !== item.bookId; });
        vm.recalculate();
      };

      vm.recalculate = function() {
        vm.cart.forEach(function(i) { if (!i.quantity || i.quantity < 1) { i.quantity = 1; } });
        vm.total = vm.cart.reduce(function(sum, i) { return sum + i.price * i.quantity; }, 0);
      };

      vm.placeOrder = function() {
        if (!vm.cart.length) { return; }
        vm.submitError = '';
        vm.success = null;
        vm.placing = true;
        const payload = {
          customerName: vm.customer.name,
          customerEmail: vm.customer.email,
          items: vm.cart.map(function(i) { return { bookId: i.bookId, title: i.title, price: i.price, quantity: i.quantity }; })
        };
        return $http.post(API_BASE + '/orders', payload)
          .then(function(res) {
            vm.success = res.data;
            vm.cart = [];
            vm.recalculate();
          })
          .catch(function(err) {
            var msg = (err && err.data && (err.data.message || err.data.details && err.data.details.join(', '))) || 'Failed to place order';
            vm.submitError = msg;
          })
          .finally(function() { vm.placing = false; });
      };

      vm.fetchBooks();
    }])
    .controller('AdminController', ['$http', '$location', 'AuthService', function($http, $location, AuthService) {
      const am = this;
      am.loading = false;
      am.error = '';
      am.orders = [];
      am.saving = {};
      am.newBook = { title: '', author: '', priceInr: null, imageUrl: '' };
      am.adding = false; am.bookError = ''; am.bookSuccess = false;

      if (!AuthService.isAuthenticated()) { $location.path('/login'); return; }

      am.fetchOrders = function() {
        am.loading = true;
        am.error = '';
        return $http.get(API_BASE + '/orders')
          .then(function(res) { am.orders = res.data || []; })
          .catch(function() { am.error = 'Failed to load orders'; })
          .finally(function() { am.loading = false; });
      };

      am.fetchOrders();

      am.updateStatus = function(order, status) {
        am.saving[order._id] = true;
        return $http.patch(API_BASE + '/orders/' + order._id + '/status', { status: status })
          .then(function(res) { order.status = res.data.status; })
          .finally(function() { am.saving[order._id] = false; });
      };

      am.addBook = function() {
        am.bookError = ''; am.bookSuccess = false; am.adding = true;
        var payload = { title: am.newBook.title, author: am.newBook.author, price: (Number(am.newBook.priceInr || 0) / 83), imageUrl: am.newBook.imageUrl };
        return $http.post(API_BASE + '/books', payload)
          .then(function() { am.bookSuccess = true; am.newBook = { title: '', author: '', priceInr: null, imageUrl: '' }; })
          .catch(function(err) { am.bookError = (err && err.data && err.data.message) || 'Failed to add book'; })
          .finally(function() { am.adding = false; });
      };
    }])
    .controller('MyOrdersController', ['$http', '$location', 'AuthService', function($http, $location, AuthService) {
      const mo = this;
      mo.loading = false; mo.error = ''; mo.orders = [];
      if (!AuthService.isAuthenticated()) { $location.path('/login'); return; }
      mo.fetch = function() {
        mo.loading = true; mo.error = '';
        return $http.get(API_BASE + '/orders/my')
          .then(function(res) { mo.orders = res.data || []; })
          .catch(function() { mo.error = 'Failed to load orders'; })
          .finally(function() { mo.loading = false; });
      };
      mo.fetch();
    }])
    .controller('LoginController', ['$http', '$location', 'AuthService', function($http, $location, AuthService) {
      const lg = this;
      lg.email = '';
      lg.password = '';
      lg.loading = false;
      lg.error = '';
      lg.login = function() {
        lg.error = '';
        lg.loading = true;
        return $http.post(API_BASE + '/auth/login', { email: lg.email, password: lg.password })
          .then(function(res) {
            AuthService.save(res.data.token, res.data.user);
            if (res.data.user.role === 'admin') { $location.path('/admin'); } else { $location.path('/'); }
          })
          .catch(function(err) { lg.error = (err && err.data && err.data.message) || 'Login failed'; })
          .finally(function() { lg.loading = false; });
      };
    }])
    .controller('RegisterController', ['$http', '$location', 'AuthService', function($http, $location, AuthService) {
      const rg = this;
      rg.name = ''; rg.email = ''; rg.password = ''; rg.loading = false; rg.error = '';
      rg.register = function() {
        rg.error = ''; rg.loading = true;
        return $http.post(API_BASE + '/auth/register', { name: rg.name, email: rg.email, password: rg.password })
          .then(function(res) { AuthService.save(res.data.token, res.data.user); $location.path('/'); })
          .catch(function(err) { rg.error = (err && err.data && err.data.message) || 'Registration failed'; })
          .finally(function() { rg.loading = false; });
      };
    }]);
})();


