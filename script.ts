class GT4Utm {

    options;

    constructor(options = {}) {
        this.options = options;
    }

    private get expires() {
        return GT4Utm.normalizeCookieExpires(this.options.expires || 10800);
    }

    private set expires(value: number) {
        this.options.expires = value;
    }

    private get urlParseRules() {
        return this.options.urlParseRules || {
            'utm_source': 'utm_source',
            'utm_medium': 'utm_medium',
            'utm_content': 'utm_content',
            'utm_campaign': 'utm_campaign',
            'utm_term': 'utm_term',
        }
    }

    private set urlParseRules(rules) {
        this.options.urlParseRules = rules;
    }

    private static getCookie(name) {
        name = `gt4u_${name}`;
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    private setCookie(name, value, options = {expires: this.expires, path: '/'}) {

        value = encodeURIComponent(value);

        let updatedCookie = `gt4u_${name}=${value}`;

        for (let propName in options) {

            if (false === options.hasOwnProperty(propName)) {
                continue;
            }
            let propValue = options[propName];

            updatedCookie += `; ${propName}`;

            if (propValue !== true) {
                updatedCookie += `=${propValue}`;
            }

        }

        document.cookie = updatedCookie;

    }

    private static normalizeCookieExpires(expires) {

        if (typeof expires == "number") {
            let date = new Date();
            date.setTime(date.getTime() + expires * 1000);
            expires = date;
        }

        if (expires.toUTCString) {
            expires = expires.toUTCString();
        }

        return expires;

    }

    private static get url() {

        return (new URL(location.href)).searchParams;

    }

    private static getUrlAttribute(name) {
        return GT4Utm.url.get(name);
    }

    private setCookiesByRules() {
        for (let cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            let urlAttributeName = this.urlParseRules[cookieName];
            let urlAttribute = GT4Utm.getUrlAttribute(urlAttributeName);
            if (urlAttribute) {
                this.setCookie(cookieName, urlAttribute);
            }
        }
    }

    private setCityCookie() {
        let _this = this;
        this.getJSON("https://ip-api.io/json/", function (result) {
            _this.setCookie('city', result.city || result.country_name);
        })
    }

    private getJSON(url, success = null, error = null) {
        let xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.onload = function () {
            if (xhr.readyState == 4 && (~~(xhr.status / 100)) == 2 && typeof success === "function") {
                success(JSON.parse(xhr.responseText));
            } else {
                if (typeof error === "function") {
                    error()
                }
            }
        };
        xhr.send(null);
    }

    public init() {
        this.setCookie('website_page', location.href);

        if (GT4Utm.getCookie('referrer') === null || this.shouldUpdateUtmCookie()) {
            this.setCookie('referrer', GT4Utm.getReferrer());
            this.setCookiesByRules();
            this.setCityCookie();
        }
    }

    private static getReferrer() {
        return ~document.referrer.indexOf(location.host) ? "" : document.referrer;
    }

    private shouldUpdateUtmCookie() {
        let savedUtmValuesString = '';
        for (let cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }

            let utmCookieValue = GT4Utm.getCookie(cookieName);
            if (utmCookieValue){
                savedUtmValuesString += GT4Utm.getCookie('cookieName');
            }
        }

        let currentUtmValuesString = '';
        for (let cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            let urlAttributeName = this.urlParseRules[cookieName];
            let urlAttribute = GT4Utm.getUrlAttribute(urlAttributeName);
            if (urlAttribute) {
                currentUtmValuesString += urlAttribute;
            }
        }

        if (currentUtmValuesString.length && currentUtmValuesString !== savedUtmValuesString){
            this.clearGt4uUtmCookie();
            return true;
        }

        return false;
    }

    private clearGt4uUtmCookie() {
        for (let cookieName in this.urlParseRules) {
            if (false === this.urlParseRules.hasOwnProperty(cookieName)) {
                continue;
            }
            this.deleteCookie(cookieName);
        }
    }

    private deleteCookie(name) {
        name = `gt4u_${name}`;
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

}
