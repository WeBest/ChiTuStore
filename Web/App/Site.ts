﻿enum EnvironmentType {
    ios,
    android,
    low,
    pc
}

class SiteCookies {
    constructor() {
    }

    sourceOpenId(value) {
        var name = this.get_cookieName('sourceOpenId');
        if (value === undefined)
            return site.cookies.get_value(name);

        if (!site.cookies.get_value(name))
            site.cookies.set_value(name, value);
    }
    returnUrl(value) {
        var name = 'returnUrl';
        if (value === undefined)
            return site.cookies.get_value(name);

        site.cookies.set_value(name, value);
    }
    appToken(value: string = undefined): string {
        //只读，数据由服务端写入
        var name = 'appToken';
        if (value === undefined)
            return site.cookies.get_value(name);

        $.cookie(name, value);
        site.cookies.set_value(name, value);
    }
    token(value: string = undefined) {
        var name = 'token';
        if (value === undefined)
            return site.cookies.get_value(name);

        site.cookies.set_value(name, value);
    }
    set_value(name: string, value: string, expires: number = 7) {
        var cookieName = site.cookies.get_cookieName(name);
        $.cookie(cookieName, value, { expires });
    }
    get_value(name: string) {
        var cookieName = site.cookies.get_cookieName(name);
        //return localStorage.getItem(cookieName);
        return $.cookie(cookieName);
    }
    get_cookieName(name) {
        return site.config.cookiePrefix + "_" + name;
    }
    //getAppToken() {
    //    /// <returns type="jQuery.Deferred"/>
    //    //debugger;
    //    if (site.cookies.appToken() != null)
    //        return $.Deferred().resolve(site.cookies.appToken());

    //    return $.ajax({
    //        url: 'Account/GetAppToken'

    //    }).then(function (data) {
    //        site.cookies.appToken(data.AppToken);//DA4A5B44C12F4E9D8E0872C4FDA8A6ABA2C0334CDB81CF84F12E29F7FB129F72F6EA604995785165
    //        return data.AppToken;
    //    });
    //}
}

class SiteStorage {
    get_item<T>(name: string) {
        var str = window.localStorage.getItem(name);
        var obj = JSON.parse(str);
        return obj;
    }
    set_item<T>(name: string, value: T) {
        var str = JSON.stringify(value);
        window.localStorage.setItem(name, str);
    }
    get historyKeywords(): string[] {
        var result = this.get_item('historyKeywords');
        if (result == null) {
            result = [];
            this.set_item('historyKeywords', result);
        }
        return result;
    }
    set historyKeywords(value: string[]) {
        this.set_item('historyKeywords', value);
    }
}

class SiteConfig {
    storeName = '零食有约'
    pageSize = 10
    defaultUrl = 'Index'
    baseUrl = 'u.alinq.cn/test/Index.html'
    purchaseUrlFormat = 'pay/Purchase.html#{0}'

    cookiePrefix = ''//该值需要设置
    serviceUrl = ''
    siteServiceUrl = ''
    memberServiceUrl = ''
    weixinServiceUrl = ''
    accountServiceUrl = ''
    imageBaseUrl = ''

    pageAnimationTime = 500
    get animationSpeed() {
        return $(window).width() / this.pageAnimationTime;
    }
    panelWithRate = 0.9
    imageDataSpliter = '#'
}

class SiteEnvironment {
    private _environmentType;
    private _isIIS: boolean;

    static isIOS(userAgent) {
        //return true;
        return userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0;
    }

    static isAndroid(userAgent): number {
        var ua = userAgent.toLowerCase();
        var android_major_version = 0;
        var match = ua.match(/android\s([0-9\.]*)/);
        if (match)
            android_major_version = parseInt(match[1], 10);

        return android_major_version;
    }

    private 'type'(): EnvironmentType {
        if (this._environmentType == null) {
            var andriod_version = SiteEnvironment.isAndroid(navigator.userAgent);
            if (andriod_version) {
                if (andriod_version < 4) {
                    this._environmentType = EnvironmentType.low;
                }
                else {
                    this._environmentType = EnvironmentType.android;
                }
            }
            else if (SiteEnvironment.isIOS(navigator.userAgent)) {
                this._environmentType = EnvironmentType.ios;
            }
            else {
                this._environmentType = EnvironmentType.pc;
            }
        }
        return this._environmentType;
    }
    get isIOS() {
        return site.env.type() == EnvironmentType.ios;
    }
    get isAndroid() {
        return site.env.type() == EnvironmentType.android;
    }
    /// <summary>
    /// 是否需要降级
    /// </summary>
    get isDegrade(): boolean {
        if (this.isWeiXin && this.isAndroid)
            return true;

        if (navigator.userAgent.indexOf('MQQBrowser') >= 0) {
            return true;
        }
        return false;
    }
    get isWeiXin(): boolean {
        var ua = navigator.userAgent.toLowerCase();
        return <any>(ua.match(/MicroMessenger/i)) == 'micromessenger';
    }
    get isIPhone() {
        return window.navigator.userAgent.indexOf('iPhone') > 0
    }


}

class Site {
    config: SiteConfig
    cookies: SiteCookies
    storage: SiteStorage
    env: SiteEnvironment
    //ready: JQueryDeferred<any>;
    //browser = new Browser(navigator.userAgent);
    error = $.Callbacks()

    private ready_funcs: Function[] = []
    private is_ready = false;

    constructor() {
        //this.ready = $.Deferred()
        this.config = new SiteConfig()
        this.cookies = new SiteCookies()
        this.storage = new SiteStorage()

        this.env = new SiteEnvironment()
    }

    private invokeReadyFunc(func: Function) {
        func();
    }

    set_config(config) {
        site.config.cookiePrefix = config.CookiePrefix;
        site.config.serviceUrl = config.ShopServiceUrl;
        site.config.memberServiceUrl = config.MemberServiceUrl;
        site.config.weixinServiceUrl = config.WeixinServiceUrl;
        site.config.siteServiceUrl = config.SiteServiceUrl;
        site.config.accountServiceUrl = config.AccountServiceUrl;
        site.config.imageBaseUrl = config.ImageBaseUrl;
        site.cookies.appToken(config.AppToken);

        this.is_ready = true;
        for (var i = 0; i < this.ready_funcs.length; i++) {
            this.invokeReadyFunc(this.ready_funcs[i]);
        }
    }

    ready(func: Function) {

        if (func == null)
            throw new Error('Argument func is null');

        if (this.is_ready) {
            this.invokeReadyFunc(func);
            return;
        }

        this.ready_funcs.push(func);
    }
}

var site: Site = window['site'] = window['site'] || new Site();


export =site;


