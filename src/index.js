import 'colors';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import shell from 'shelljs';
import util from './util';
import npm from './npm';

const getDest = util.getDest;
const copy = util.copy;
const getModuleConfig = npm.getModuleConfig;
const downloadModuleAndUnzip = npm.downloadModuleAndUnzip;
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
  console.log(`The project directory is ${dest.green}`);

  console.log('Getting a list of project types');
  const projects = (await getModuleConfig('aimake-cli-config')).projects;
  const answers = await inquirer.prompt([
    {
      name: 'initType',
      type: 'list',
      message: 'Please select the project type',
      choices: projects.map(item => ({
        name: item.description,
        value: item.name,
      })),
    },
    {
      name: 'name',
      type: 'input',
      message: 'Please enter the project name',
      default: path.basename(dest),
    },
    {
      name: 'version',
      type: 'input',
      message: 'Please enter the project version number',
      default: '1.0.0',
    },
    {
      name: 'author',
      type: 'input',
      message: 'Please enter the project author',
      default: process.env.USER || process.env.USERNAME || '',
    },
  ]);

  console.log('Downloading project files ...');
  shell.rm('-rf', TMP_DIR);
  const config = await getModuleConfig(answers.initType);
  await downloadModuleAndUnzip(config.dist.tarball);

  console.log('Project is being generated ...');
  try {
    await copy(TMP_DIR, dest, (file) => {
      replacer(file, answers);
    });
  } catch (e) {
    console.log(e);
  }

  console.log('Project generation completion, installation dependence ...');
  shell.cd(dest);
  shell.exec('npm install -d');

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
