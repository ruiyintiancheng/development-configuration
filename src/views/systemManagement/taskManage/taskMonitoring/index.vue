<template>
  <div>
    <el-row>
      <el-col :span="5"
              class="code-tree">
        <div style="padding:20px 10px;height:100%;">
          <el-form style="padding:10px;border:1px solid #ebeef5;height:100%;"
                   label-position="left"
                   label-width="80px">
            <el-form-item label="数据时间:">
              <el-date-picker v-model="dateValue"
                              align="left"
                              type="date"
                              value-format="yyyy-MM-dd"
                              placeholder=""
                              size="small"
                              style="width:100%"
                              :picker-options="datePickerOptions">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="任务类型:">
              <el-select v-model="selectValue1"
                         placeholder=""
                         style='width:100%'>
                <el-option label="数据采集"
                           value="数据采集"></el-option>
                <el-option label="数据整合"
                           value="数据整合"></el-option>
                <el-option label="数据校验"
                           value="数据校验"></el-option>
                <el-option label="生成文件"
                           value="生成文件"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="任务描述:">
              <el-input size="mini"></el-input>
            </el-form-item>
            <el-form-item label="执行状态:">
              <el-select v-model="selectValue"
                         placeholder=""
                         style='width:100%'>
                <el-option label="计算失败"
                           value="计算失败"></el-option>
                <el-option label="未计算"
                           value="未计算"></el-option>
                <el-option label="计算完成"
                           value="计算完成"></el-option>
                <el-option label="计算中"
                           value="计算中"></el-option>
                <el-option label="重新计算"
                           value="重新计算"></el-option>
              </el-select>
            </el-form-item>
            <el-button icon="el-icon-search"
                       size="mini"
                       type="primary"
                       @click="searchFrom">查询</el-button>
            <el-button icon="el-icon-refresh"
                       size="mini">重置</el-button>
            <div style="border:1px soild #000;margin-top:10px">
              <el-form-item label="颜色说明:">
              </el-form-item>
              <div class='rect'
                   style="background-color:red">
                失败
              </div>
              <div class='rect'
                   style="background-color:green">
                成功
              </div>
              <div class='rect'
                   style="background-color:rgb(68, 154, 243)">
                计算中
              </div>
              <div class='rect'
                   style="background-color:grey">
                未计算
              </div>
              <div class='rect'
                   style="background-color:orange">
                重算
              </div>
            </div>
          </el-form>
        </div>
      </el-col>
      <el-col :span="19">
        <el-tabs v-model="activeName"
                 style="paddingLeft:20px;">
          <el-tab-pane label="任务监控图"
                       name="first">
            <div>
              <processG6 @open-dialog="openDialog"></processG6>
            </div>
          </el-tab-pane>
          <el-tab-pane label="任务监控列表"
                       name="second">
            <div>
              <tableList @open-dialog="openDialog"></tableList>
            </div>
          </el-tab-pane>
        </el-tabs>
        <task-dialog :param="dialogParam"
                     ref="dialogBtn"></task-dialog>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import SearchForm from 'search-form-ry'
import tableList from './taskTableList'
import processG6 from './processG6'
import taskDialog from './dialog'
export default {
  sourceData: {},
  currentFun: '',
  name: 'taskMonitoringIndex',
  components: { processG6, tableList, SearchForm, taskDialog },
  mounted() {
    this.getOption()
  },
  data() {
    return {
      dialogParam: {
        url: '',
        title: ''
      },
      activeName: 'first',
      selectValue: '', // 下拉选值
      selectValue1: '',
      dateValue: '', // 日期选择值
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  created() {
    this.dateValue = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
  },
  methods: {
    // 初始化数据
    getOption() {
      baseRequest('/basic/taskManage/flowChartedges2').then(response => { // 线
        const result = response.data
        this.sourceData = result.item
      })
    },
    searchFrom() {
    },
    openDialog(obj) {
      for (var item in obj) {
        this.dialogParam[item] = obj[item]
      }
      this.$refs.dialogBtn.openDialog()
      return false
    }
  },
  watch: {}
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
div .rect {
  font-size: 12px;
  text-align: center;
  display: inline-block;
  line-height: 30px;
  width: 70px;
  height: 30px;
  //   padding: 2px;
  margin: 4px;
}
el-form-item {
  margin-left: 80px;
}
</style>