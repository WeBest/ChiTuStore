﻿import app = require('Application');
import site = require('Site');
import menu = require('ui/Menu');

class TopBar {
    public element: HTMLElement
    public leftButtons: HTMLElement[]
    public rightButtons: HTMLElement[]

    constructor(element) {
        this.element = element;
        this.leftButtons = [];
        this.rightButtons = [];
    }

    title(value) {
        if (value)
            $(this.element).find('h4').html(value);

        return $(this.element).find('h4').html();
    }
    visible(value: boolean = undefined) {
        if (value === undefined)
            return $(this.element).is(':visible');

        if (value === false)
            $(this.element).hide();

        if (value === true)
            $(this.element).show();

    }
    createLeftButton(icon, callback) {
        var childnodes = this.element.childNodes || [];
        if (childnodes.length == 0)
            return;

        var $btn = $('<a href="javascript:" class="leftButton" style="padding-right:20px;padding-left:20px;margin-left:-20px;"><i class="' + icon + '"></i></a>')
            .insertBefore(<HTMLElement>this.element.childNodes[0]);

        $btn.on('click', callback);
        $btn.on('tap', callback);

        return $btn[0];
    }
    createRightButton(icon, callback) {
        var childnodes = this.element.childNodes || [];
        if (childnodes.length == 0)
            return;

        var $btn = $('<a href="javascript:" class="rightButton" style="padding-right:20px;padding-left:20px;margin-right:-20px;"><i class="' + icon + '"></i></a>')
            .insertBefore(<HTMLElement>this.element.childNodes[0]);

        $btn.on('click', callback);
        $btn.on('tap', callback);

        return $btn[0];
    }

    height() {
        return TOPBAR_HEIGHT;
    }
}


function defaultTitle(page: chitu.Page): string {
    var values = page.routeData.values();
    var controller = values.controller;
    var action = values.action;
    var titles = {
        'User': {
            Coupon: '我的优惠券',
            Favors: '我的收藏',
            Index: '个人中心',
            Login: '登录',
            Messages: '我的消息',
            ModifyPassword: '修改密码',
            ReceiptList: '收货信息',
            ReceiptEdit: '编辑地址',
            Recharge: '充值',
            RechargeList: '充值记录',
            Register: '用户注册',
            ScoreList: '我的积分',
            UserInfo: '用户信息',
            UserInfoItemEdit: '&nbsp;'
        },
        Shopping: {
            Evaluation: '商品评价',
            OrderDetail: '订单详情',
            OrderList: '我的订单',
            OrderProducts: '确认订单',
            Invoice: '发票信息',
            ProductEvaluate: '评价晒单',
            Purchase: '订单概况',
            ShoppingCart: '购物车',
        },
        Home: {
            News: '资讯详情',
            NewsList: '微资讯',
            ProductComments: '商品评价',
            ProductList: '商品列表',
            Product: '商品详情',
            ScoreExchange: '积分兑换',
        },
        AccountSecurity: {
            MobileBinding: '手机绑定',
            MobileSetting: '手机设置',
            Setting: '&nbsp;',
            ResetPassword: '重置密码',
        },
        Error: {
            ConnectFail: '网络错误'
        }
    }
    var title: string = (titles[controller] || {})[action];

    return title;
}

function page_created(sender, page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>
    var title = defaultTitle(page);
    if (title) {
        var $page_header = $(page.node()).find('.page-header');
        var $children = $page_header.children();

        var topbar: TopBar;
        if ($children.length > 0) {
            topbar = new TopBar($(topbar_html).insertBefore($children[0])[0]);
        }
        else {
            topbar = new TopBar($(topbar_html).appendTo($page_header)[0]);
        }
        topbar.element.style.zIndex = $page_header[0].style.zIndex;

        //$(page.node()).find('.page-loading').append(topbar_html);

        (<any>page).topbar = topbar;
        topbar.title(title);

        if (page.name != 'Home.Index' && page.name != 'Home.Class' && page.name != 'Home.NewsList' &&
            page.name != 'Shopping.Shopping.Cart' && page.name != 'User.Index') {
            topbar.createLeftButton('icon-chevron-left', function () {
                app.back();
            })
        }
    }

    //page.load.add(function (sender) {
    //    if (sender.topbar) {
    //        //(<TopBar>sender.topbar).element.style.position = 'unset';

    //        (<TopBar>sender.topbar).visible(true);
    //        var title = defaultTitle(sender);
    //        (<TopBar>sender.topbar).title(title == null ? "&nbsp;" : title);
    //    }
    //})
}

var topbar_html = '<div class="bg-primary topbar" style="width:100%;"><h4></h4></div>';
var TOPBAR_HEIGHT: number = 50;
app.pageCreated.add(page_created);
if (app.currentPage() != null)
    page_created(app, app.currentPage());


if (window['plus']) {
    window['plus'].navigator.setStatusBarStyle('UIStatusBarStyleBlackOpaque');
    window['plus'].navigator.setStatusBarBackground('#bf0705');
}

export = TopBar;

