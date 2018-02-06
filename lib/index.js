'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _run = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(inputDest) {
    var dest, projects, answers, config;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getDest(inputDest);

          case 2:
            dest = _context.sent;

            console.log('The project directory is ' + dest.green);

            console.log('Getting a list of project types');
            _context.next = 7;
            return getModuleConfig('aimake-cli-config');

          case 7:
            projects = _context.sent.projects;
            _context.next = 10;
            return _inquirer2.default.prompt([{
              name: 'initType',
              type: 'list',
              message: 'Please select the project type',
              choices: projects.map(function (item) {
                return {
                  name: item.description,
                  value: item.name
                };
              })
            }, {
              name: 'name',
              type: 'input',
              message: 'Please enter the project name',
              default: _path2.default.basename(dest)
            }, {
              name: 'version',
              type: 'input',
              message: 'Please enter the project version number',
              default: '1.0.0'
            }, {
              name: 'author',
              type: 'input',
              message: 'Please enter the project author',
              default: process.env.USER || process.env.USERNAME || ''
            }]);

          case 10:
            answers = _context.sent;


            console.log('Downloading project files ...');
            _shelljs2.default.rm('-rf', TMP_DIR);
            _context.next = 15;
            return getModuleConfig(answers.initType);

          case 15:
            config = _context.sent;
            _context.next = 18;
            return downloadModuleAndUnzip(config.dist.tarball);

          case 18:

            console.log('Project is being generated ...');
            _context.prev = 19;
            _context.next = 22;
            return copy(TMP_DIR, dest, function (file) {
              replacer(file, answers);
            });

          case 22:
            _context.next = 27;
            break;

          case 24:
            _context.prev = 24;
            _context.t0 = _context['catch'](19);

            console.log(_context.t0);

          case 27:

            console.log('Project generation completion, installation dependence ...');
            _shelljs2.default.cd(dest);
            _shelljs2.default.exec('npm install -d');

            process.exit(0);

          case 31:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[19, 24]]);
  }));

  return function _run(_x) {
    return _ref.apply(this, arguments);
  };
}();

require('colors');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _npm = require('./npm');

var _npm2 = _interopRequireDefault(_npm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDest = _util2.default.getDest;
var copy = _util2.default.copy;
var getModuleConfig = _npm2.default.getModuleConfig;
var downloadModuleAndUnzip = _npm2.default.downloadModuleAndUnzip;
var TMP_DIR = _path2.default.join(_os2.default.tmpdir(), 'aimake-cli-init-tmp');

/**
 * 执行文件替换操作
 */
function replacer(_file, _answers) {
  var file = _file;
  var answers = _answers;
  /**
   * 上传npm包之后.gitignore会变成.npmignore
   */
  if (/\.npmignore$/.test(file.path)) {
    file.path = file.path.replace('.npmignore', '.gitignore');
  }

  // 只对根目录的package.json进行替换
  if (file.path === _path2.default.join(TMP_DIR, 'package.json')) {
    var contents = JSON.parse(file.contents.toString());
    contents.name = answers.name;
    contents.version = answers.version;
    contents.author = answers.author;
    file.contents = Buffer.from((0, _stringify2.default)(contents, null, 2));
  }
}

exports.default = {
  /*
   * 定义命令选项
   */
  options: [
    // ['-r, --registry <registry>', 'change npm registry']
  ],

  /*
   * argument 命令参数
   * options  命令配置
   */
  run: function run(argument) {
    _run(argument);
  }
};
module.exports = exports['default'];