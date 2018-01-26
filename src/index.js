import 'colors';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import shell from 'shelljs';
import util from './util';
import yarn from './yarn';

const getDest = util.getDest;
const copy = util.copy;
const getModuleConfig = yarn.getModuleConfig;
const downloadModuleAndUnzip = yarn.downloadModuleAndUnzip;
const TMP_DIR = path.join(os.tmpdir(), 'aimake-cli-init-tmp');

/**
 * 执行文件替换操作
 */
function replacer(_file, _answers) {
  const file = _file;
  const answers = _answers;
  /**
   * 上传npm包之后.gitignore会变成.npmignore
   */
  if (/\.npmignore$/.test(file.path)) {
    file.path = file.path.replace('.npmignore', '.gitignore');
  }

  // 只对根目录的package.json进行替换
  if (file.path === path.join(TMP_DIR, 'package.json')) {
    const contents = JSON.parse(file.contents.toString());
    contents.name = answers.name;
    contents.version = answers.version;
    contents.author = answers.author;
    file.contents = Buffer.from(JSON.stringify(contents, null, 2));
  }
}

async function run(inputDest) {
  const dest = await getDest(inputDest);
  console.log(`项目目录为 ${dest.green}`);

  console.log('正在获取项目类型列表');
  const projects = (await getModuleConfig('aimake-cli-config')).projects;
  const answers = await inquirer.prompt([
    {
      name: 'initType',
      type: 'list',
      message: '请选择项目类型',
      choices: projects.map(item => ({
        name: item.description,
        value: item.name,
      })),
    },
    {
      name: 'name',
      type: 'input',
      message: '请输入项目名',
      default: path.basename(dest),
    },
    {
      name: 'version',
      type: 'input',
      message: '请输入项目版本号',
      default: '1.0.0',
    },
    {
      name: 'author',
      type: 'input',
      message: '请输入项目作者',
      default: process.env.USER || process.env.USERNAME || '',
    },
  ]);

  console.log('正在下载项目文件');
  shell.rm('-rf', TMP_DIR);
  const config = await getModuleConfig(answers.initType);
  await downloadModuleAndUnzip(config.dist.tarball);

  console.log('正在生成项目');
  try {
    await copy(TMP_DIR, dest, (file) => {
      replacer(file, answers);
    });
  } catch (e) {
    console.log(e);
  }

  console.log('项目生成完成，正在安装依赖');
  shell.cd(dest);
  shell.exec('yarn install --dev');

  process.exit(0);
}

export default {
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
  run(argument) {
    run(argument);
  },
};
