<template>
  <div>
    <el-form v-if="dialogForm === 1"
             :rules="rules"
             ref="formOption"
             :model="optionParam"
             label-position="left"
             label-width="100px"
             style='width: 300px; margin:auto;'>
      <el-form-item label="URL"
                    prop="resourceUrl">
        <el-input type="text"
                  clearable
                  style="width: 155px;"
                  class="filter-item"
                  v-model="optionParam.resourceUrl"></el-input>
      </el-form-item>
      <el-form-item label="资源描述"
                    prop="resourceDesc">
        <el-input type="text"
                  clearable
                  style="width: 155px;"
                  class="filter-item"
                  v-model="optionParam.resourceDesc"></el-input>
      </el-form-item>
      <el-form-item label="资源类型"
                    prop="resourceType">
        <el-select clearable
                   style="width: 155px;"
                   class="filter-item"
                   v-model="optionParam.resourceType">
          <el-option v-for="(text,value) in typeOptions"
                     :key="value"
                     :label="text"
                     :value="value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据权限"
                    prop="permissionFlag">
        <el-select type="text"
                   clearable
                   style="width: 155px;"
                   class="filter-item"
                   v-model="optionParam.permissionFlag">
          <el-option v-for="(text,value) in permissionFlag"
                     :key="value"
                     :label="text"
                     :value="value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="表名"
                    prop="tableId">
        <el-autocomplete v-model="optionParam.tableName"
                         :fetch-suggestions="querySearchAsync"
                         @select="handleAutoSelect"
                         :disabled="dialogStatus === 'update'"
                         style="width: 300px;margin-left:10px;">
          <template slot-scope="{ item }">
            <div class="name">{{ item.tableName }}</div>
            <span class="desc">{{ item.tableDesc }}</span>
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-form>
    <param-return ref="param"
                  v-else-if="dialogForm === 2"
                  :data="params"></param-return>
    <!-- <el-table v-else-if="dialogForm === 2" ref="multipleTable2" :data="params"  v-bind="$attrs"  @selection-change="handleSelectionChange2" height=420>
                  <el-table-column
                    type="selection"
                    width="55">
                  </el-table-column>
                  <el-table-column  label="参数名">
                    <template slot-scope="scope">                   
                        {{ scope.row.fieldName }}
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数类型">
                    <template slot-scope="scope">
                      {{scope.row.fieldType}}
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数描述">
                    <template slot-scope="scope">
                      {{scope.row.fieldDesc}}
                    </template>
                  </el-table-column>
            </el-table> -->
    <param-return ref="return"
                  v-else-if="dialogForm === 4"
                  :data="returns"></param-return>
    <!-- <el-table v-else-if="dialogForm === 4" ref="multipleTable4" :data="returns"  v-bind="$attrs"  @selection-change="handleSelectionChange4">
                  <el-table-column
                    type="selection"
                    width="55">
                  </el-table-column>
                  <el-table-column  label="参数名">
                    <template slot-scope="scope">                   
                        {{ scope.row.fieldName }}
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数类型">
                    <template slot-scope="scope">
                      {{scope.row.fieldType}}
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数描述">
                    <template slot-scope="scope">
                      {{scope.row.fieldDesc}}
                    </template>
                  </el-table-column>
            </el-table> -->
  </div>
</template>

<script>
import { baseRequest } from '@/api/base'
import ParamReturn from './ParamReturn'
export default {
  props: {
    dialogStatus: String,
    dialogForm: Number
  },
  components: {
    ParamReturn
  },
  data() {
    return {
      optionParam: {
        resourceId: null,
        resourceUrl: '',
        resourceDesc: '',
        resourceType: '',
        permissionFlag: '',
        tableId: '',
        tableName: ''
      },
      typeOptions: {
        '0': '系统资源',
        '1': '功能资源',
        '2': '无token验证'
      },
      permissionFlag: {
        '0': '无权限',
        '1': '有权限'
      },
      rules: {
        resourceUrl: [
          { required: true, message: '请输入URL', trigger: 'blur' }
        ],
        resourceDesc: [
          { required: true, message: '请输入资源描述', trigger: 'blur' }
        ],
        resourceType: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ],
        permissionFlag: [
          { required: true, message: '请选择数据权限', trigger: 'change' }
        ],
        tableId: [
          { required: true, message: '请输入表名', trigger: 'change' }
        ]
      },
      params: [],
      returns: [],
      selectParams: [],
      selectReturns: [],
      recordSelect: {}
    }
  },
  methods: {
    // 自动补全
    querySearchAsync(queryString, cb) {
      if (!queryString || queryString === '') return
      const param = { queryString }
      baseRequest('/basic/resource/autoGetTable', param).then(response => {
        cb(response.data.item)
      })
    },
    // 补全赋值
    handleAutoSelect(item) {
      this.optionParam.tableName = item.tableName
      this.optionParam.tableId = item.tableId
    },
    resetForm(resourceId) {
      if (this.dialogStatus === 'update') {
        const param = { resourceId }
        baseRequest('/basic/resource/singleTableUpdate', param).then(response => {
          const items = response.data.item.items
          for (const key in this.optionParam) {
            this.optionParam[key] = items[key] ? items[key] : null
          }
          this.params = response.data.item.menuParam
          this.returns = response.data.item.menuReturn
        })
      } else {
        for (const key in this.optionParam) {
          this.optionParam[key] = null
        }
      }
      this.selectParams = []
      this.selectReturns = []
      this.recordSelect = {}
      this.$nextTick(function() {
        this.$refs.formOption.clearValidate()
      })
    },
    formSubmit() {
      if (this.dialogForm === 1) {
        this.$refs.formOption.validate((valid) => {
          if (valid) {
            if (this.dialogStatus === 'create') {
              baseRequest('/basic/resource/SingleTableParams', this.optionParam).then(response => {
                this.params = response.data.item.params
                this.returns = response.data.item.returns
                this.recordSelect = {}
                this.$emit('changeDialogForm', 2)
              })
            } else {
              this.$emit('changeDialogForm', 2)
              // if (this.recordSelect.params) {
              //   this.preChecked()
              // } else {
              //   this.setHistory()
              //   this.$nextTick(function() {
              //     this.getChecked(this.params)
              //   })
              // }
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else if (this.dialogForm === 2) {
        this.$emit('changeDialogForm', 4)
        // if (this.dialogStatus === 'update') {
        // if (this.recordSelect.returns) {
        //   this.preChecked()
        // } else {
        //   this.setHistory()
        //   this.$nextTick(function() {
        //     this.getChecked(this.returns)
        //   })
        // }
        // } else {
        this.params = this.$refs.param.getParamsMenu()
        this.$nextTick(function() {
          this.$refs.return.getSelect()
        })
        // if (this.recordSelect.params) {]
        //   this.preChecked()
        // } else {
        //   this.setHistory()
        // }
        // }
      } else {
        this.returns = this.$refs.return.getParamsMenu()
        const params = {}
        for (const key in this.optionParam) {
          if (key !== 'tableName') {
            params[key] = this.optionParam[key]
          }
        }
        params.params = this.params
        params.returns = this.returns
        if (this.dialogStatus === 'create') {
          params.configMode = '3'
          baseRequest('/basic/resource/add', params).then(response => {
            this.$Message.success('操作成功')
            this.$emit('closeMask')
          })
        } else {
          baseRequest('/basic/resource/update', params).then(response => {
            this.$Message.success('操作成功')
            this.$emit('closeMask')
          })
        }
      }
    },
    // 记录选中行
    handleSelectionChange2(val) {
      this.selectParams = val
    },
    // 记录选中行
    handleSelectionChange4(val) {
      this.selectReturns = val
    },
    getChecked(data) {
      for (const iterator of data) {
        if (iterator.checked && iterator.checked === '1') {
          if (this.dialogForm === 2) {
            this.$refs.multipleTable2.toggleRowSelection(iterator, true)
          } else {
            this.$refs.multipleTable4.toggleRowSelection(iterator, true)
          }
        }
      }
    },
    setHistory(num) {
      if (this.dialogForm === 4) {
        const temp = []
        for (const iterator of this.selectReturns) {
          temp.push(iterator)
        }
        this.recordSelect.returns = temp
      } else if (this.dialogForm === 2) {
        if (!num || this.dialogStatus === 'update') {
          const temp = []
          for (const iterator of this.selectParams) {
            temp.push(iterator)
          }
          this.recordSelect.params = temp
        } else {
          this.selectParams = []
          this.selectReturns = []
          this.recordSelect = {}
        }
      }
    },
    preChecked(num) {
      if (this.dialogForm === 4) {
        this.returns = this.$refs.return.getParamsMenu()
        this.$nextTick(function() {
          this.$refs.param.getSelect()
        })
      } else if (this.dialogForm === 2 && this.dialogStatus === 'update') {
        this.params = this.$refs.param.getParamsMenu()
      }
    }
  }
}
</script>
