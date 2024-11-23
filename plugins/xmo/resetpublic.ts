/**
 * @author xmo
 * @name resetpublic
 * @team xmo
 * @version 0.0.1
 * @description 根据作者和团队自动开启或关闭Public状态
 * @rule ^(修正发布状态)$
 * @admin true
 * @priority 9999
 * @classification ["插件"]
 * @public false
 * @disable false
 */

/*
 不允许自动更改的插件请添加“@keeppublic”配置。
*/

const jsonSchema = BncrCreateSchema.object({
  basic: BncrCreateSchema.object({
    author: BncrCreateSchema.string().setTitle('作者').setDescription(`含有“@author 作者”的将执行修正发布状态`).setDefault(''),
    team: BncrCreateSchema.string().setTitle('团队').setDescription(`含有“@team 团队”的将执行修正发布状态`).setDefault(''),
  }).setTitle('基本设置').setDefault({})
});

const ConfigDB = new BncrPluginConfig(jsonSchema);
let author = '';
let team = '';

import fs from 'fs';
import path from 'path';

module.exports = async (s: Sender) => {
  if (!Object.keys(ConfigDB.userConfig).length) {
    s.reply('请前往前端web"插件配置"来完成插件首次配置。');
    return;
  }
  author = ConfigDB.userConfig.basic.author || '';
  team = ConfigDB.userConfig.basic.team || '';
  if (!author && !team) {
    s.reply('未填写“作者”或“团队”，请填写后再试');
    return;
  }

  const directories = ['Adapter', 'plugins'].map(e => path.join(sysMethod.runWorkDir, e));

  directories.forEach(directory => {
    processDirectory(directory);
  });

  console.log('字符串替换完成。');
  s.reply('字符串替换完成。');
};

// 替换文件中的字符串
function replaceInFile(filePath: string) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`读取文件出错: ${filePath}`, err);
      return;
    }
    if (!filePath.includes('resetpublic') && !data.includes('@keeppublic')) {
      if (data.includes('@public true')) {
        let verifyt = false;
        if (author && team) {
          verifyt = !data.includes(`@author ${author}`) && !data.includes(`@team ${team}`);
        } else {
          if (author) {
            verifyt = !data.includes(`@author ${author}`);
          }
          if (team) {
            verifyt = !data.includes(`@team ${team}`);
          }
        }
        if (verifyt) {
          const result = data.replace('@public true', '@public false');
          fs.writeFile(filePath, result, 'utf8', err => {
            if (err) {
              console.error(`写入文件出错: ${filePath}`, err);
            }
          });
        }
      }
      if (data.includes('@public false')) {
        let verifyf = false;
        if (author && team) {
          verifyf = data.includes(`@author ${author}`) || data.includes(`@team ${team}`);
        } else {
          if (author) {
            verifyf = data.includes(`@author ${author}`);
          }
          if (team) {
            verifyf = data.includes(`@team ${team}`);
          }
        }
        if (verifyf) {
          const result = data.replace('@public false', '@public true');
          fs.writeFile(filePath, result, 'utf8', err => {
            if (err) {
              console.error(`写入文件出错: ${filePath}`, err);
            }
          });
        }
      }
    }
  });
}

// 递归遍历目录
function processDirectory(directory: string) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`读取目录出错: ${directory}`, err);
      return;
    }
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`获取文件状态出错: ${filePath}`, err);
          return;
        }
        if (stats.isFile()) {
          replaceInFile(filePath);
        } else if (stats.isDirectory()) {
          processDirectory(filePath);
        }
      });
    });
  });
}
