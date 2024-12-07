/**
 * @author xmo
 * @name one
 * @team xmo
 * @version 0.1.4
 * @description 一言 鸡汤 心灵鸡汤
 * @rule ^(一言|鸡汤|心灵鸡汤)$
 * @rule ^(新一言)$
 * @rule ^(爱情公寓语录)$
 * @rule ^(随机人设)$
 * @rule ^(温馨提示语)$
 * @admin false
 * @priority 0
 * @classification ["插件"]
 * @public true
 * @disable false
 */
module.exports = async s => {
  const userword = s.param(1);
  const request = require('request');
  let apiurl = '';
  let options = '';
  switch(userword) {
    case '一言':
    case '鸡汤':
    case '心灵鸡汤':
      apiurl = 'https://v1.hitokoto.cn/';
      options = {
        'method': 'GET',
        'url': `${apiurl}`,
        'headers': {
        }
      };
      request(options, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          sbody = JSON.parse(response.body);
          // console.log(sbody);
          s.reply(sbody.hitokoto);
        }
      });
      break;
    
      case '新一言':
        apiurl = 'https://api.kuleu.com/api/yiyan';
        options = {
          'method': 'GET',
          'url': `${apiurl}`,
          'headers': {
          }
        };
        request(options, function (error, response) {
          if (error) {
            console.log(error);
          } else {
            sbody = response.body;
            // console.log(sbody);
            s.reply(sbody);
          }
        });
        break;
        
    case '爱情公寓语录':
      apiurl = 'https://api.kuleu.com/api/aiqinggongyu';
      options = {
        'method': 'GET',
        'url': `${apiurl}`,
        'headers': {
        }
      };
      request(options, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          sbody = JSON.parse(response.body);
          if (sbody.code != 200) {
            console.log(sbody);
            s.reply('接口出错');
            return;
          }
          // console.log(sbody);
          s.reply(sbody.data);
        }
      });
      break;
    
    case '随机人设':
      apiurl = 'https://api.kuleu.com/api/suiji_renshe';
      options = {
        'method': 'GET',
        'url': `${apiurl}`,
        'headers': {
        }
      };
      request(options, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          sbody = response.body.replaceAll('*', '');
          // console.log(sbody);
          let strs = ['姓名：','性别：','身高：','年龄：','体重：','爱好：','幸运物：','生日：','职业：','外貌：','对象的名字：','讨厌的东西：','爱吃的东西：','个人的故事背景：','关于幸运物的故事：','未来展望：',
                      '姓名:','性别:','身高:','年龄:','体重:','爱好:','幸运物:','生日:','职业:','外貌:','对象的名字:','讨厌的东西:','爱吃的东西:','个人的故事背景:','关于幸运物的故事:','未来展望:',
                      '个人故事背景:','个人故事背景：','与对象的故事:','与对象的故事：','个人背景:','幸运物故事:','个人背景：','幸运物故事：','个人故事:','个人故事：','对未来的展望：','对未来的展望:'];
          if (sbody.indexOf('人物性格：') == -1 && sbody.indexOf('人物性格:') == -1) {
            strs.push('性格：');
            strs.push('性格:');
          } else {
            strs.push('人物性格：');
            strs.push('人物性格:');
          }
          if (!sbody.match(/关于幸运物([^ \n]+)关联故事:/g) && !sbody.match(/关于幸运物([^ \n]+)关联故事：/g) && sbody.indexOf('幸运物关联故事：') == -1 && sbody.indexOf('幸运物关联故事:') == -1) {
            strs.push('关联故事：');
            strs.push('关联故事:');
          } else {
            strs.push('关于幸运物的关联故事：');
            strs.push('关于幸运物的关联故事:');
            strs.push('幸运物关联故事：');
            strs.push('幸运物关联故事:');
          }
          if (sbody.indexOf('对未来的看法：') == -1 && sbody.indexOf('对未来的看法:') == -1 && sbody.indexOf('对自己未来的看法：') == -1 && sbody.indexOf('对自己未来的看法:') == -1) {
            strs.push('未来的看法：');
            strs.push('未来的看法:');
          } else {
            strs.push('对未来的看法：');
            strs.push('对未来的看法:');
            strs.push('对自己未来的看法：');
            strs.push('对自己未来的看法:');
          }


          let zzstrs = [];
          let zzstr = '';
          zzstr = sbody.match(/关于幸运物([^ \n]+)故事:/g);
          if (zzstr) {
            for (const s of zzstr) {
            zzstrs.push(s);
            }
          }
          zzstr = sbody.match(/关于幸运物([^ \n]+)故事：/g);
          if (zzstr) {
            for (const s of zzstr) {
            zzstrs.push(s);
            }
          }
          zzstr = sbody.match(/和对象([^ \n]+)故事:/g);
          if (zzstr) {
            for (const s of zzstr) {
            zzstrs.push(s);
            }
          }
          zzstr = sbody.match(/和对象([^ \n]+)故事：/g);
          if (zzstr) {
            for (const s of zzstr) {
            zzstrs.push(s);
            }
          }
          for (const s of zzstrs) {
            strs.push(s);
          }

          // console.log(strs);
          let nstrs = [];
          let nstr = 0;
          for (const str of strs) {
            nstr = sbody.indexOf(str);
            if (nstr != -1) {
              nstrs.push(sbody.indexOf(str));
            }
          }
          nstrs.sort((x, y) => {
            return x - y;
          });
          const nnstrs = nstrs.length;
          let x = 0;
          let nstrsn = [];
          for (const xnstr of nstrs) {
            if (x == nnstrs) {
              nstrsn.push(xnstr);
            } else {
              x = x + 1;
              if (nstrs[x] != xnstr) {
                nstrsn.push(xnstr);
              }
            }
          }
          let nstrss = nstrsn.slice();
          nstrss.push(sbody.length);
          nstrss = nstrss.slice(1);
          // console.log(nstrs);
          // console.log(nstrsn);
          // console.log(nstrss);
          let sfromats = `>>>随机人设<<<\n`;
          let i = 0;
          for (const sstart of nstrsn) {
            sfromats = `${sfromats}\n${sbody.slice(sstart, nstrss[i])}`;
            i = i + 1;
          }
          s.reply(sfromats);
        }
      });
      break;
    
    case '温馨提示语':
      apiurl = 'https://api.kuleu.com/api/getGreetingMessage?type=json';
      options = {
        'method': 'GET',
        'url': `${apiurl}`,
        'headers': {
        }
      };
      request(options, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          sbody = JSON.parse(response.body);
          if (sbody.code != 200) {
            console.log(sbody);
            s.reply('接口出错');
            return;
          }
          // console.log(sbody);
          s.reply(`${sbody.data.greeting}！${sbody.data.tip}`);
        }
      });
      break;

    default:
    console.log("else");
  }

};
