'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _tar = require('tar');

var _tar2 = _interopRequireDefault(_tar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TMP_DIR = _path2.default.join(_os2.default.tmpdir(), 'aimake-cli-init-tmp');

/**
 * 简单模板替换
 */
function compile(template) {
  return function (context) {
    return template.replace(/\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function (match, name) {
      return context[name] == null ? match : context[name];
    });
  };
}

function $request(url) {
  return new _promise2.default(function (resolve, reject) {
    (0, _request2.default)({
      url: url,
      json: true
    }, function (err, response, body) {
      if (!err && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(err || response.statusCode);
      }
    });
  });
}

// 获取某个包的最新信息
var NPM_MODULE_LATEST = compile('http://registry.npmjs.com/{{ name }}/latest');

/**
 * 获取npm包的最新信息
 */
exports.getModuleConfig = function (name) {
  return $request(NPM_MODULE_LATEST({
    name: name
  }));
};

/**
 * 下载并解压包
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
exports.downloadModuleAndUnzip = function (url) {
  return new _promise2.default(function (resolve, reject) {
    var onerror = function onerror(err) {
      reject(err);
    };

    var gunzip = _zlib2.default.createGunzip();
    gunzip.on('error', onerror);

    var extracter = _tar2.default.Extract({ path: TMP_DIR, strip: 1 });
    extracter.on('error', onerror);
    extracter.on('end', function () {
      resolve();
    });
    _request2.default.get(url).on('error', onerror).pipe(gunzip).pipe(extracter);
  });
};