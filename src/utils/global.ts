/*
 * @Description: 全局方法
 * @Author: yujiaoLiu
 * @Date: 2021-03-08
 */

// instanceof 判断 实例是某个类
export function checkInstanceOf(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

export function typeOfClassname(obj) {
    let _typeof;
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj &&
                typeof Symbol === "function" &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? "symbol"
                : typeof obj;
        };
    }
    return _typeof(obj);
}

export function isnull(v) {
    if (v == undefined || v == null) return false;
    return true;
}