import readline from 'readline';
import path from 'path';
import fs from 'fs';
import through from 'through2';
import vfs from 'vinyl-fs';

const CWD = process.cwd();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
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
  return !fs.existsSync(dest) || (fs.statSync(dest).isDirectory() && !fs.readdirSync(dest).length);
}

/**
 * 获取项目路径
 */
exports.getDest = async function getDest(_inputDest) {
  let inputDest = _inputDest;
  if (!inputDest) {
    inputDest = await ask('请输入项目目录路径（默认为当前目录）: ') || '.';
  }
  const dest = path.resolve(CWD, inputDest);

  if (!isSafeDest(dest)) {
    console.log(`${dest} 文件已存在或不为空目录`.red);
    process.exit(1);
  }

  return dest;
};

/**
 * 对项目文件执行一些替换操作
 */
function replace(replacer) {
  return through.obj((file, enc, cb) => {
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
exports.copy = (src, dest, replacer) => {
  return new Promise((resolve, reject) => {
    vfs.src('**/*', {
      cwd: src,
      cwdbase: true,
      dot: true,
    })
      .pipe(replace(replacer))
      .pipe(vfs.dest(dest))
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .resume();
  });
};
