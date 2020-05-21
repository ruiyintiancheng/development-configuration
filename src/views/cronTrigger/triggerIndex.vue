<template>
  <div>
      <el-form-item label="表达式" >
       <el-input v-model="cronExpression" clearable auto-complete="off" :style="{width:'195px'}">
          <el-button slot="append" icon="el-icon-setting" @click="openDialog()" title="打开图形配置"></el-button>
       </el-input>
        <div style="text-align:left;padding-top:3px;padding-left: 100px;">
          <span style="color: #E6A23C; font-size: 12px;">{{cronTip}}</span>
        </div>
      </el-form-item>
     <el-dialog title="表达式" append-to-body v-el-drag-dialog :close-on-click-modal="false" style="width:100%;" custom-class="dialog-default" :visible.sync="dialogTableVisible">
       <div class="dialog-contant-default">
        <cron ref="cron" :paramData='paramData' v-model="form.cronExpression"></cron>
       </div>
       <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取消</el-button>
        <el-button type="primary" @click="setCron">确定</el-button>
       </div>
     </el-dialog>
  </div>
</template>
<script>
import cron from './components/cron'
import elDragDialog from '@/directive/el-dragDialog'

export default {
  directives: { elDragDialog },
  name: 'cronTriggerIndex',
  components: {
    cron
  },
  props: {
    paramData: Object
  },
  data() {
    return {
      showCronBox: false,
      dialogTableVisible: false,
      cronExpression: '',
      cronTip: '',
      startDate: '',
      endDate: '',
      form: {
        cronExpression: ''
      }
    }
  },
  methods: {
    setCron() {
      this.cronTip = this.$refs.cron.cronTip
      if (this.$refs.cron.activeName === 'cron') {
        this.cronExpression = this.$refs.cron.cronExpress
      } else {
        this.cronExpression = this.$refs.cron.simpExpress
        // this.$emit('callback', this.$refs.cron.startDate, this.$refs.cron.endDate)
      }
      this.dialogTableVisible = false
    },
    // 打开图形配置
    openDialog() {
      this.dialogTableVisible = true
      this.$nextTick(function() {
        if (this.paramData.defType === '1') {
          this.$refs.cron.activeName = 'cron'
          this.$refs.cron.setCornVal('* * * * * ? *')
          this.$refs.cron.setCornVal(this.cronExpression)
        } else if (this.paramData.defType === '2') {
          this.$refs.cron.activeName = 'simp'
          // this.$refs.cron.setSimpVal('0/0')
          this.$refs.cron.setSimpVal(this.simpExpress)
        }
      })
    },
    changeSimp() {
      const result = this.cronExpression.split('/')
      const start = result[0]
      const end = result[1]
      const time = result[2]
      const space = result[3]
      this.cronTip = '开始时间: ' + start + ', 结束时间: ' + end + ', 重复次数: ' + time + '次, 重复间隔: ' + space + '秒'
    },
    changeCron() {
      const resultArry = []
      const result = this.cronExpression.split(' ')
      const year = result[6]
      const week = result[5]
      const month = result[4]
      const day = result[3]
      const hour = result[2]
      const minute = result[1]
      const second = result[0]
      if (this.cronExpression !== '') {
        if (year !== '*' && year !== '?') {
          const years = result[6].split('-')
          if (years[0] === years[1]) {
            resultArry.push(years[0] + '年')
          } else {
            resultArry.push(result[6].replace('-', '年至') + '年')
          }
        } else {
          resultArry.push('')
        }

        if (week !== '?') {
          if (week === '*') {
            resultArry.push('')
          } else {
            if (week.indexOf('-') !== -1) {
              resultArry.push('从星期' + week.replace('-', '至星期'))
            } else if (week.indexOf('/') !== -1) {
              resultArry.push('从星期' + week.replace('/', '开始,每') + '天执行一次')
            } else if (week.indexOf('#') !== -1) {
              resultArry.push('本月第' + week.replace('#', '周,星期'))
            } else if (week.indexOf('L') !== -1) {
              resultArry.push('本月最后一个星期' + week.replace('L', ''))
            } else {
              if (week !== '') {
                resultArry.push('星期' + week.replace(new RegExp(',', 'gm'), ',星期'))
              }
            }
          }
        } else {
          resultArry.push('')
        }

        if (month !== '?') {
          if (month === '*') {
            resultArry.push('')
          } else {
            if (month.indexOf('-') !== -1) {
              resultArry.push('从' + month.replace('-', '月至') + '月')
            } else if (month.indexOf('/') !== -1) {
              resultArry.push('从' + month.replace('/', '月开始,每') + '月执行一次')
            } else {
              resultArry.push(month.replace(new RegExp(',', 'gm'), '月,') + '月')
            }
          }
        } else {
          resultArry.push('')
        }

        if (day !== '?') {
          if (day === '*') {
            resultArry.push('')
          } else if (day.indexOf('-') !== -1) {
            resultArry.push('从' + day.replace('-', '日至') + '日')
          } else if (day.indexOf('/') !== -1) {
            resultArry.push('从' + day.replace('/', '日开始,每') + '日执行一次')
          } else if (day.indexOf('W') !== -1) {
            resultArry.push('本月' + day.replace('W', '号工作日'))
          } else if (day === 'L') {
            resultArry.push('本月最后一天')
          } else {
            if (day !== '') {
              resultArry.push(day.replace(new RegExp(',', 'gm'), '号,') + '号')
            }
          }
        } else {
          resultArry.push('')
        }

        if (hour === '*') {
          resultArry.push('')
        } else {
          if (hour.indexOf('-') !== -1) {
            resultArry.push('从' + hour.replace('-', '时至') + '时')
          } else if (hour.indexOf('/') !== -1) {
            resultArry.push('从' + hour.replace('/', '时开始,每') + '时执行一次')
          } else {
            if (hour !== '') {
              resultArry.push(hour.replace(new RegExp(',', 'gm'), '时,') + '时')
            }
          }
        }

        if (minute === '*') {
          resultArry.push('')
        } else {
          if (minute.indexOf('-') !== -1) {
            resultArry.push('从' + minute.replace('-', '分至') + '分')
          } else if (minute.indexOf('/') !== -1) {
            resultArry.push('从' + minute.replace('/', '分开始,每') + '分执行一次')
          } else {
            if (minute !== '') {
              resultArry.push(minute.replace(new RegExp(',', 'gm'), '分,') + '分')
            }
          }
        }

        if (second === '*') {
          resultArry.push('')
        } else {
          if (second.indexOf('-') !== -1) {
            resultArry.push('从' + second.replace('-', '秒至') + '秒')
          } else if (second.indexOf('/') !== -1) {
            resultArry.push('从' + second.replace('/', '秒开始,每') + '秒执行一次')
          } else {
            if (second !== '') {
              resultArry.push(second.replace(new RegExp(',', 'gm'), '秒,') + '秒')
            }
          }
        }
        this.cronTip = resultArry.join(' ')
      } else {
        this.cronTip = ''
      }
    }
  }
}
</script>
<style>
.input-both{
  height: 52px;
  width: 100%;
  text-align: center;
}
.input-label{
  width:89px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}
</style>