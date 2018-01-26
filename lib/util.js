'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CWD = process.cwd();
var rl = _readline2.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new _promise2.default(function (resolve) {
    rl.question(question, function (answer) {
      resolve(answer.trim());
      rl.resume();
    });
  });
}

/**
 * 是否是安全的目标路径
 * 目标路径为空或者为空目录
 * @param  {String}  dest
 * @return {Boolean}
 */
function isSafeDest(dest) {
  return !_fs2.default.existsSync(dest) || _fs2.default.statSync(dest).isDirectory() && !_fs2.default.readdirSync(dest).length;
}

/**
 * 获取项目路径
 */
exports.getDest = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_inputDest) {
    var inputDest, dest;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            inputDest = _inputDest;

            if (inputDest) {
              _context.next = 8;
              break;
            }

            _context.next = 4;
            return ask('请输入项目目录路径（默认为当前目录）: ');

          case 4:
            _context.t0 = _context.sent;

            if (_context.t0) {
              _context.next = 7;
              break;
            }

            _context.t0 = '.';

          case 7:
            inputDest = _context.t0;

          case 8:
            dest = _path2.default.resolve(CWD, inputDest);


            if (!isSafeDest(dest)) {
              console.log((dest + ' \u6587\u4EF6\u5DF2\u5B58\u5728\u6216\u4E0D\u4E3A\u7A7A\u76EE\u5F55').red);
              process.exit(1);
            }

            return _context.abrupt('return', dest);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function getDest(_x) {
    return _ref.apply(this, arguments);
  }

  return getDest;
}();

/**
 * 对项目文件执行一些替换操作
 */
function replace(replacer) {
  return _through2.default.obj(function (file, enc, cb) {
    if (!file.stat.isFile() || !replacer) {
      return cb();
    }
    try {
      replacer(file);
    } catch (e) {
      // no action
    }

    return cb(null, file);
  });
}

/**
 * copy src to dest
 */
exports.copy = function (src, dest, replacer) {
  return new _promise2.default(function (resolve, reject) {
    _vinylFs2.default.src('**/*', {
      cwd: src,
      cwdbase: true,
      dot: true
    }).pipe(replace(replacer)).pipe(_vinylFs2.default.dest(dest)).on('end', function () {
      resolve();
    }).on('error', function (err) {
      reject(err);
    }).resume();
  });
};