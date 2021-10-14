/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-09 09:49:20
 */
import { typeOfClassname } from "@/utils/global";

export default class TimerManager {
    static DAY_SECONDS = 60 * 60 * 24;
    static WEEK_SECONDS = TimerManager.DAY_SECONDS * 7;

    private static _registerT_Ids = {};

    public constructor() {
    }

    public static addTimer(timeout, repeat, callback, thisobj) {
        if (timeout <= 0) {
            console.log("TimerManager.RegisterSecond Error, nLeftSecond <= 0");
            return 0;
        }
        if (typeOfClassname(callback) !== "function") {
            console.log("TimerManager.RegisterSecond Error, fCallback not function:");
            return 0;
        }

        let timerArgs = { repeatCount: repeat, fCallback: callback, thisobj: thisobj, curRepeatCount: 0 };
        let intervalId: number = setInterval(this._Handler, timeout, timerArgs);
        timerArgs[intervalId] = timerArgs;
        this._registerT_Ids[intervalId] = timerArgs;

        return intervalId;
    }

    private static _Handler(arg): void {
        if (!arg) return;
        arg.callback.apply(arg.thisobj, arg.intervalId);
        if (arg.repeatCount > 0) {
            arg.curRepeatCount++;
            if (arg.curRepeatCount == arg.repeatCount) {
                this.clearTimer(arg.intervalId);
            }
        }
    }

    public static clearTimer(id) {
        clearInterval(id);
        delete this._registerT_Ids[id];
    }
    //The end
}