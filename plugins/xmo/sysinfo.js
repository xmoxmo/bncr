/**
 * @author 啊屁
 * @team xmo
 * @name sysinfo
 * @version 1.0.4
 * @description 获取系统信息
 * @rule ^(sysinfo)$
 * @admin true
 * @public true
 * @priority 1
 * @disable false
 * @classification ["插件"]
 */

module.exports = async (sender) => {
    try {
        const os = require('os');
        const si = require('systeminformation');

        const platform = os.platform();
        const arch = os.arch();
        const uptime = os.uptime();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const cpuInfo = os.cpus();
        const osType = os.type();
        const osRelease = os.release();
        const loadAvg = os.loadavg();

        // 获取GPU信息
        const gpuData = await si.graphics();
        const gpus = gpuData.controllers.map(gpu => `${gpu.vendor} ${gpu.model}`).join(', ');

        // 计算并格式化内存使用情况
        const totalMemMB = (totalMem / 1024 / 1024).toFixed(2);
        const usedMemMB = (usedMem / 1024 / 1024).toFixed(2);
        const freeMemMB = (freeMem / 1024 / 1024).toFixed(2);

        // 计算并格式化运行时间
        const uptimeDays = Math.floor(uptime / 86400);
        const uptimeHours = Math.floor((uptime % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeFormatted = `${uptimeDays}天 ${uptimeHours}小时 ${uptimeMinutes}分钟`;

        const output = `
**系统信息**
- 操作系统: ${osType} ${osRelease}
- 架构: ${arch}
- 运行时间: ${uptimeFormatted}
- 总内存: ${totalMemMB} MB
- 内存使用: 已使用 ${usedMemMB} MB / 未使用 ${freeMemMB} MB
- CPU型号: ${cpuInfo[0].model}（速度: ${cpuInfo[0].speed} MHz）（核心数: ${cpuInfo.length})
- 系统负载(1/5/15分钟): ${loadAvg.map(avg => avg.toFixed(2)).join('/')}
- GPU: ${gpus || '无GPU信息'}
        `;

        await sender.reply(output);
    } catch (error) {
        console.error(`获取系统信息时出错: ${error.message}`);
        await sender.reply('获取系统信息时出现错误，请稍后再试。');
    }
};
