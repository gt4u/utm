var GT4Utm = /** @class */ (function () {
    function GT4Utm(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
    }
    Object.defineProperty(GT4Utm.prototype, "expires", {
        get: function () {
            return GT4Utm.normalizeCookieExpires(this.options.expires || 10800);
        },
        set: function (value) {
            this.options.expires = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GT4Utm.prototype, "urlParseRules", {
        get: function () {
            return this.options.urlParseRules || {
                'utm_source': 'utm_source',
                'utm_medium': 'utm_medium',
                'utm_content': 'utm_content',
                'utm_campaign': 'utm_campaign',
                'utm_term': 'utm_term',
            };
        },
        set: function (rules) {
            this.options.urlParseRules = rules;
        },
        enumerable: false,
        configurable: true
    });
    GT4Utm.getCookie = function (name) {
        name = "gt4u_".concat(name);
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : null;
    };
    GT4Utm.prototype.setCookie = function (name, value, options) {
        if (options === void 0) { options = { expires: this.expires, path: '/' }; }
        value = encodeURIComponent(value);
        var updatedCookie = "gt4u_".concat(name, "=").concat(value);
        for (var propName in options) {
            if (false === options.hasOwnProperty(propName)) {
                continue;
            }
            var propValue = options[propName];
            updatedCookie += "; ".concat(propName);
            if (propValue !== true) {
                updatedCookie += "=".concat(propValue);
            }
        }
        document.cookie = updatedCookie;
    };
    GT4Utm.normalizeCookieExpires = function (expires) {
        if (typeof expires == "number") {
            var date = new Date();
            date.setTime(date.getTime() + expires * 1000);
            expires = date;
        }
        if (expires.toUTCString) {
            expires = expires.toUTCString();
        }
        return expires;
    };
    Object.defineProperty(GT4Utm, "url", {
        get: function () {
            return (new URL(location.href)).searchParams;
        },
        enumerable: false,
        configurable: true
    });
    GT4Utm.getUrlAttribute = function (name) {
        return GT4Utm.url.get(name);
    };
    GT4Utm.prototype.setCookiesByRules = function () {
        for (var cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            var urlAttributeName = this.urlParseRules[cookieName];
            var urlAttribute = GT4Utm.getUrlAttribute(urlAttributeName);
            if (urlAttribute) {
                this.setCookie(cookieName, urlAttribute);
            }
        }
    };
    GT4Utm.prototype.setCityCookie = function () {
        var _this = this;
        this.getJSON("https://ip-api.io/json/", function (result) {
            _this.setCookie('city', result.city || result.country_name);
        });
    };
    GT4Utm.prototype.getJSON = function (url, success, error) {
        if (success === void 0) { success = null; }
        if (error === void 0) { error = null; }
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.onload = function () {
            if (xhr.readyState == 4 && (~~(xhr.status / 100)) == 2 && typeof success === "function") {
                success(JSON.parse(xhr.responseText));
            }
            else {
                if (typeof error === "function") {
                    error();
                }
            }
        };
        xhr.send(null);
    };
    GT4Utm.prototype.init = function () {
        this.setCookie('website_page', location.href);
        if (GT4Utm.getCookie('referrer') === null || this.shouldUpdateUtmCookie()) {
            this.setCookie('referrer', GT4Utm.getReferrer());
            this.setCookiesByRules();
            this.setCityCookie();
        }
    };
    GT4Utm.getReferrer = function () {
        return ~document.referrer.indexOf(location.host) ? "" : document.referrer;
    };
    GT4Utm.prototype.shouldUpdateUtmCookie = function () {
        var savedUtmValuesString = '';
        for (var cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            var utmCookieValue = GT4Utm.getCookie(cookieName);
            if (utmCookieValue) {
                savedUtmValuesString += GT4Utm.getCookie('cookieName');
            }
        }
        var currentUtmValuesString = '';
        for (var cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            var urlAttributeName = this.urlParseRules[cookieName];
            var urlAttribute = GT4Utm.getUrlAttribute(urlAttributeName);
            if (urlAttribute) {
                currentUtmValuesString += urlAttribute;
            }
        }
        if (currentUtmValuesString.length && currentUtmValuesString !== savedUtmValuesString) {
            this.clearGt4uUtmCookie();
            return true;
        }
        return false;
    };
    GT4Utm.prototype.clearGt4uUtmCookie = function () {
        for (var cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            this.deleteCookie(cookieName);
        }
    };
    GT4Utm.prototype.deleteCookie = function (name) {
        name = "gt4u_".concat(name);
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };
    return GT4Utm;
}());
