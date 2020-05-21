<template>
  <div class="scheduleDef"
       v-loading="loading">
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="search" />
          <span>筛选查询</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-search"
                     @click="searchOption"
                     type="primary">查询</el-button>
          <el-button icon="el-icon-refresh"
                     @click="getOption">重置</el-button>
          <a @click="searchToggle=false"
             v-if="searchToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="searchToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <search-form v-show="searchToggle"
                   ref="searchForm"
                   :searchFormData="configData"></search-form>
    </div>
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-plus"
                     @click="addOption">添加</el-button>
          <a @click="tableToggle=false"
             v-if="tableToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <basic-table v-show="tableToggle"
                   ref="basicTable"
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <el-table-column slot="optionColumn"
                         label="操作"
                         fixed="right"
                         align="center"
                         :width="250">
          <template slot-scope="scope">
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="danger"
                       plain
                       size="mini"
                       @click="deleteForm(scope.row)">删除</el-button>
            <el-button type="success"
                       plain
                       size="mini"
                       @click="seeView(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="dialogTitle[operateStatus]"
               :visible.sync="formVisible"
               :close-on-click-modal='true'
               v-el-drag-dialog
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <update-form ref="updateFrom"
                     :labelWidth="110"
                     :elFunction="elFunction"
                     :updateFormData="updateFormData"></update-form>
        <el-form ref="form"
                 label-position="left"
                 label-width="110px"
                 class="baseUpdate-form"
                 :model="item">
          <el-form-item label="集群运行方式"
                        :error="error.execType"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="addData.execType"
                       clearable
                       collapse-tags
                       placeholder="请选择">
              <el-option label="全部运行"
                         value="0">
              </el-option>
              <el-option label="指定运行"
                         value="1">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="serverCodes"
                        v-if="addData.execType !== '0'"
                        label="Server编码"
                        :error="error.serverCodes"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="item.serverCodes"
                       clearable
                       multiple
                       collapse-tags
                       placeholder="请选择">
              <el-option v-for="item in options"
                         :key="item.VALUE"
                         :label="item.LABEL"
                         :value="item.VALUE">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="定时类型"
                        :error="error.defType"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select @change='defTypeChange'
                       class="form-input"
                       v-model="addData.defType"
                       clearable
                       collapse-tags
                       placeholder="请选择">
              <el-option label="corn表达式"
                         value="1">
              </el-option>
              <el-option label="simple时间点"
                         value="2">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态"
                        :error="error.status"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="addData.status"
                       clearable
                       collapse-tags
                       placeholder="请选择">
              <el-option label="启用"
                         value="1">
              </el-option>
              <el-option label="停用"
                         value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="异常终止"
                        :error="error.interruptFlag"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="addData.interruptFlag"
                       clearable
                       collapse-tags
                       placeholder="请选择">
              <el-option label="是"
                         value="1">
              </el-option>
              <el-option label="否"
                         value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input class="form-input"
                      v-model="addData.taskDes"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="任务参数">
            <el-input class="form-input"
                      v-model="addData.taskParam"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker class="form-input"
                            clearable
                            @change="startChang()"
                            v-model="addData.startTime"
                            type="datetime"
                            placeholder="请选择开始时间"
                            value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker class="form-input"
                            clearable
                            @change="endChang()"
                            v-model="addData.endTime"
                            type="datetime"
                            placeholder="请选择结束时间"
                            value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <times :paramData="addData"
                 ref="times"
                 @callback="callback"></times>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
    <schedule-fact ref="scheduleFact"></schedule-fact>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import scheduleFact from './scheduleFact'
import times from '../cronTrigger/triggerIndex'
const url = '/basic/schedules/selects'
export default {
  name: 'scheduleDefIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    scheduleFact,
    times
  },
  data() {
    return {
      addData: {
        execType: '',
        endTime: '',
        startTime: '',
        interruptFlag: '',
        defType: '',
        status: '',
        taskDes: '',
        taskParam: ''
      },
      options: [],
      startTime: '',
      endTime: '',
      cronExpress: '',
      simpExpress: '',
      loading: false,
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      defId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      },
      item: {
        serverCodes: []
      },
      error: {
        serverCodes: ''
      },
      elFunction: { // 绑定事件
        defTypeChange: (val) => {
          this.$refs.times.cronExpression = ''
          this.$refs.times.cronTip = ''
        }
      }
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 点击添加
    addOption() {
      this.operateStatus = 1
      this.getAddForm()
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.defId = row.defId
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      baseRequest('/basic/schedules/getAddData', param).then(response => {
        this.item.serverCodes = []
        for (var i in this.addData) {
          this.addData[i] = ''
        }
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.times.cronExpression = ''
          this.$refs.times.cronTip = ''
          this.$refs.form.clearValidate()
          this.$refs.updateFrom.clearValidate()
        })
      })

      this.getCascadeSelect(null, function(data) {
        this.options = data
      }.bind(this))
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = { defId: row.defId }
      baseRequest('/basic/schedules/select', param).then(response => {
        const result = response.data
        const arr = result.item.serverCodes.split(',')
        const intArr = []
        for (var j = 0; j < arr.length; j++) {
          intArr.push(parseInt(arr[j]))
        }
        this.item.serverCodes = intArr
        for (var i in this.addData) {
          this.addData[i] = result.item[i]
        }
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.times.cronExpression = result.item.expression
          if (result.item.defType === '1') {
            this.$refs.times.changeCron()
          } else {
            this.$refs.times.changeSimp()
          }
          this.$refs.form.clearValidate()
          this.$refs.updateFrom.clearValidate()
        })
      })
      this.getCascadeSelect(null, function(data) {
        this.options = data
      }.bind(this))
    },
    defTypeChange(val) {
      this.addData.startTime = ''
      this.addData.endTime = ''
      this.$refs.times.cronExpression = ''
      this.$refs.times.cronTip = ''
    },
    // 删除
    deleteForm(row) {
      const param = { defId: row.defId }
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/schedules/delete', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      })
    },
    // 保存操作
    saveOperate() {
      this.clearError()
      this.$refs.form.validate((valid) => {
        if (valid) {
          const param = this.$refs.updateFrom.getFormData()
          param.serverCodes = this.item.serverCodes.join(',')
          param.expression = this.$refs.times.cronExpression
          // param.startTime = this.startTime
          // param.endTime = this.endTime

          for (var i in this.addData) {
            param[i] = this.addData[i]
          }

          if (this.operateStatus === 1) {
            this.$refs.updateFrom.saveRequest('/schedules/add', param).then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          } else if (this.operateStatus === 2) {
            param.defId = this.defId
            this.$refs.updateFrom.saveRequest('/schedules/update', param).then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          }
        } else {
          return false
        }
      })
    },
    // 获取Server编码下拉选
    getCascadeSelect(param, callback) {
      baseRequest('/basic/schedules/getServerCode', param).then(response => {
        callback && callback(response.data.item)
      })
    },
    seeView(row) {
      this.$refs.scheduleFact.openDialog(row)
    },
    getDefType() {
      const param = this.$refs.updateFrom.getFormData()
      param.startTime = this.startTime
      param.endTime = this.endTime
      return param
    },
    callback(startVal, endVl) {
      this.startTime = startVal
      this.endTime = endVl
    },
    // 开始日期与表达式的联动
    startChang() {
      const param = this.$refs.updateFrom.getFormData()
      if (param.defType === '2') {
        const cronExpression = this.$refs.times.cronExpression
        if (cronExpression) {
          const result = cronExpression.split('/')
          result[0] = this.startTime
          this.$refs.times.cronExpression = result.join('/')
          this.$refs.times.changeSimp()
        } else {
          this.$refs.times.cronExpression = `${this.startTime}/${this.endTime}/1/1`
        }
      }
    },
    // 结束日期与表达式的联动
    endChang() {
      const param = this.$refs.updateFrom.getFormData()
      if (param.defType === '2') {
        const cronExpression = this.$refs.times.cronExpression
        if (cronExpression) {
          const result = cronExpression.split('/')
          result[1] = this.endTime
          this.$refs.times.cronExpression = result.join('/')
          this.$refs.times.changeSimp()
        } else {
          this.$refs.times.cronExpression = `${this.startTime}/${this.endTime}/1/1`
        }
      }
    },
    // 验证操作
    validateElseItem(validateMsg) {
      for (const key in validateMsg) {
        if (this.error.hasOwnProperty(key)) {
          this.error[key] = validateMsg[key]
        }
      }
    },
    // 清空error
    clearError() {
      for (const key in this.error) {
        this.error[key] = ''
      }
    }
  }
}
</script>
<style lang="scss">
.scheduleDef {
  .baseUpdate-form {
    margin-left: calc(50% - 130px);
    .form-input {
      width: 190px;
    }
  }
}
</style>