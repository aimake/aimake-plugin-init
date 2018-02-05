import path from 'path';
import os from 'os';
import zlib from 'zlib';
import request from 'request';
import tar from 'tar';

const TMP_DIR = path.join(os.tmpdir(), 'aimake-cli-init-tmp');

/**
 * 简单模板替换
 */
function compile(template) {
  return context => template.replace(/\\?\{\{\s*([^{}\s]+)\s*\}\}/g, (match, name) => ((context[name] == null) ? match : context[name]));
}

function $request(url) {
  return new Promise((resolve, reject) => {
    request({
      url,
      json: true,
    }, (err, response, body) => {
      if (!err && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(err || response.statusCode);
      }
    });
  });
}

// 获取某个包的最新信息
const NPM_MODULE_LATEST = compile('http://registry.npm.alibaba-inc.com/{{ name }}/latest');

/**
 * 获取npm包的最新信息
 */
exports.getModuleConfig = name => $request(NPM_MODULE_LATEST({
  name,
}));

/**
 * 下载并解压包
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
exports.downloadModuleAndUnzip = (url) => {
  return new Promise((resolve, reject) => {
    const onerror = (err) => {
      reject(err);
    };

    const gunzip = zlib.createGunzip();
    gunzip.on('error', onerror);

    const extracter = tar.Extract({ path: TMP_DIR, strip: 1 });
    extracter.on('error', onerror);
    extracter.on('end', () => {
      resolve();
    });
    request.get(url).on('error', onerror).pipe(gunzip).pipe(extracter);
  });
};
