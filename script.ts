class GT4Utm {

    options;

    constructor(options = {}) {
        this.options = options;
    }

    private get expires() {
        return this.options.expires || 10800;
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
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    private setCookie(name, value, options = null) {

        options.expires = options.expires || this.expires;

        options.expires = GT4Utm.normalizeCookieExpires(options.expires);

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
            this.setCookie(cookieName, GT4Utm.getUrlAttribute(urlAttributeName));
        }
    }

    private setCityCookie() {
        let _this = this;
        this.getJSON("https://ip-api.io/json/", function () {
            _this.setCookie('city', document.referrer);
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
        this.setCookie('hostname', location.hostname.replace("www.", ""));
        if (GT4Utm.getCookie('referrer') === null) {
            this.setCookie('referrer', document.referrer);
            this.setCookiesByRules();
            this.setCityCookie();
        }
    }

}