var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var moy = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ValidateResponse(response) {
    return response && response.data && typeof (response.data) == "object";
}

function Initialize(obj, source, metadata) {
    var prop;

    for (prop in source) {
        obj[prop] = source[prop];
    }

    for (prop in metadata) {
        obj[prop] =
            metadata[prop].Type == "tinyint(1)" ? (obj[prop] == true) :
            metadata[prop].Type == "date" ?       (obj[prop] == null ? null : LocalDate(obj[prop])) :
                                                  (obj[prop] == null ? "" : obj[prop].toString());
    }
}

function ToSql(value, metadata)
{
    return  !metadata ? value :
            metadata.Type == "tinyint(1)" ? (value ? 1 : 0) :
            metadata.Type == "date" ?   (UtcDate(value).toISOString().substr(0,10)) : value;
}

function LocalDate(value) {
    value = new Date(value);
    value.setMinutes(value.getMinutes() + value.getTimezoneOffset());
    return value;
}


function UtcDate(value)
{
    value = new Date(value);
    value.setMinutes(value.getMinutes()-value.getTimezoneOffset());
    return value;
}

function AnimationSlide() {
    return {
        beforeAddClass: function(element, className, done) {
            if(className === 'ng-hide') {
                element.slideUp(done);
            }
        },
        removeClass: function(element, className, done) {
            if(className === 'ng-hide') {
                element.hide().slideDown(done);
            }
        }
    }
}

// IE11 doesn't support findIndex
Array.prototype.findIndex2 = function(predicate, thisArg) {
    if (this === null) {
        throw new TypeError('Cannot read property \'findIndex\' of null');
    }

    if (typeof predicate !== "function") {
        throw new TypeError(typeof predicate + ' is not a function');
    }

    var arrLength = this.length;
    var index = -1;

    for (var i = 0; i < arrLength; i++) {
        if (predicate.call(thisArg, this[i], i, this)) {
            index = i;
            break;
        }
    }

    return index;
};