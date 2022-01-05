import { formatDate } from "@angular/common";

/***************************************************************************************************
/ In de main.ts staat een import van deze file! Hierdoor zijn de extensions global beschikbaar. 
/***************************************************************************************************/
export {}

/***************************************************************************************************
/ De NUMBER primitive wordt uitgebreid met een extra method om een bedrag te formatteren.
/***************************************************************************************************/

declare global {
    interface Number {
        AmountFormat(): string;
    }
}

Number.prototype.AmountFormat = function () {
    return '€ ' + Number(this).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

declare global {
    interface Number {
        AmountFormatHTML(): string;
    }
}
Number.prototype.AmountFormatHTML = function () {
    return '&euro; ' + Number(this).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


/***************************************************************************************************
/ De STRING primitive wordt uitgebreid.
/***************************************************************************************************/
declare global {
    interface String {
        toBoolean(): boolean;
        toDutchTextString(): string;
    }
}

String.prototype.toBoolean = function () {
    return String(this) == '1' ? true : false;
};

String.prototype.toDutchTextString = function () {
    return String(this) == '1'? 'Ja' : 'Nee';
};

/***************************************************************************************************
/ De BOOLEAN primitive wordt uitgebreid.
/***************************************************************************************************/
declare global {
    interface Boolean {
        ToNumberString(): string;
        toDutchTextString(): string;
    }
}

Boolean.prototype.ToNumberString = function () {
    return Boolean(this) ? '1' : '0';
};

Boolean.prototype.toDutchTextString = function () {
    return Boolean(this) ? 'Ja' : 'Nee';
};

/***************************************************************************************************
/ De DATE primitive wordt uitgebreid.
/***************************************************************************************************/
declare global {
    interface Date {
        to_YYYY_MM_DD(): string;
    }
}

Date.prototype.to_YYYY_MM_DD = function () {
    return formatDate(this, 'yyyy-MM-dd', 'nl');
};

/***************************************************************************************************
/ De delayedForEach extensie is gebaseerd op een stuk JS code gevonden op: https://gist.github.com/fernandosavio/6011834 
/***************************************************************************************************/
declare global {
    interface Array<T> {
        delayedForEach(callback, timeout, thisArg, done: T): Array<T>;
        timeOutPointer: number;
        clearTimeout(timeoutPointer): void;
    }
}

Array.prototype.delayedForEach = function (callback, timeout, thisArg, done) {
    var i = 0,
        l = this.length,
        self = this;

    var caller = function () {
        callback.call(thisArg || self, self[i], i, self);
        if (++i < l) {
            self.timeoutPointer = setTimeout(caller, timeout);
        } else if (done) {
            self.timeoutPointer = setTimeout(done, timeout, thisArg, self);
        }
    };

    caller();
    return this;
};

Array.prototype.clearTimeout = function () {
    clearTimeout(this.timeoutPointer); // De timeout wordt gecanceld waardoor de processing stopt
};