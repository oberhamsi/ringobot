export('index',
       'showDay');

var config = require('./config');
var fs = require('fs');
var {format: formatDate} = require('ringo/utils/date');
var {skinResponse} = require('ringo/webapp/response');

function index(req) {
    return showDay(req, today());
}

function showDay(req, day) {
    // day is expected to be sanitized by url routing pattern in config
    return skinResponse('./skins/day.html', {day: day,
                                             records: readDay(day),
                                             days: listDays(),});
}

// -- helpers --

function today()        formatDate(new Date(), 'yyyy-MM-dd');
function fileToDay(log) log.slice(0, 10);
function dayToPath(day) fs.join(config.logDir, day + '.log');
function listDays()     fs.list(config.logDir).map(fileToDay).sort().reverse();

function readDay(day) {
    try {
        return fs.read(dayToPath(day)).trim().split('\n').map(
                function (line) {
                    var rec = JSON.parse(line);
                    var fld = "is_" + rec.type;
                    rec[fld] = true;
                    return rec;
                });
    } catch (e if e.javaException instanceof java.io.FileNotFoundException) {
        return [];
    }
}
