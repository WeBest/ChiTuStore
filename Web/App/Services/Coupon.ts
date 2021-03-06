﻿import site = require('Site');
import services = require('Services/Service');

class Coupon {
    private extendCoupon(coupon) {
        if (coupon.UsedDateTime) {
            coupon.StatusText = '已使用';
        }
        else if (coupon.ValidEnd < new Date(Date.now())) {
            coupon.StatusText = '已过期';
        }
        else {
            coupon.StatusText = '未使用';
        }
    }
    getMyCoupons = (args) => {
        var result = services.callMethod(site.config.serviceUrl, 'Coupon/GetMyCoupons', args);
        result.then($.proxy((data) => {
            /// <param name="data" type="Array"/>
            $(data).each((i, item) => this.extendCoupon(item));

            result['loadCompleted'] = data.length < site.config.pageSize;
            return data;
        }, result));

        return result;
    }
    getAvailableCoupons = (orderId) => {
        return services.callMethod(site.config.serviceUrl, 'Coupon/GetAvailableCouponCodes', { orderId: orderId })
            .then((data) => {
                $(data).each((i, item) => this.extendCoupon(item));
                return data;
            });
    }
}

services['coupon'] = services['coupon'] || new Coupon();
export = <Coupon>services['coupon'];