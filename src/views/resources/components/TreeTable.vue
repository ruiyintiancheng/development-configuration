<template>
  <div class="resource-tree">
    <h3 style="margin:0;">参数选择</h3>
    <el-table ref="multipleTable"
              :data="formatData"
              :row-style="showRow"
              v-bind="$attrs"
              @select="checkedSelect"
              @select-all="selectAll"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection"
                       width="55">
      </el-table-column>
      <el-table-column label="参数名">
        <template slot-scope="scope">
          <el-input v-if="scope.row.edit"
                    class="edit-input"
                    size="small"
                    placeholder="参数名"
                    v-model="scope.row.fieldName"></el-input>
          <template v-else>
            <span v-for="space in scope.row._level"
                  class="ms-tree-space"
                  :key="space"></span>
            <span class="tree-ctrl"
                  v-if="iconShow(scope.row)"
                  @click="toggleExpanded(scope.$index)">
              <i v-if="!scope.row._expanded"
                 class="el-icon-plus"></i>
              <i v-else
                 class="el-icon-minus"></i>
            </span>
            {{ scope.row.fieldName }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="参数类型">
        <template slot-scope="scope">
          <el-select v-if="scope.row.edit"
                     clearable
                     class="edit-input"
                     size="small"
                     placeholder="参数类型"
                     v-model="scope.row.fieldType">
            <el-option v-for="(item,index) in selectOptions"
                       :key="index"
                       :value="item.value"
                       :label="item.label"></el-option>
          </el-select>
          <template v-else>
            {{scope.row.fieldType | changeLabel}}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="参数描述">
        <template slot-scope="scope">
          <el-input v-if="scope.row.edit"
                    class="edit-input"
                    size="small"
                    placeholder="参数描述"
                    v-model="scope.row.fieldDesc"></el-input>
          <template v-else>
            {{scope.row.fieldDesc}}
          </template>
        </template>
      </el-table-column>
      <el-table-column v-if="configMode === '1'"
                       align="center"
                       :render-header="renderHeader"
                       :width="250">
        <template slot-scope="scope">
          <!-- <el-button v-if="scope.row.isMap" type="primary" size="mini">修改</el-button>   -->
          <el-button v-if="(parameterType === '1' || scope.row.isMap) && !scope.row.edit"
                     @click="addChildren(scope.$index)"
                     size="mini"
                     plain>添加</el-button>
          <el-button v-if="canUpdate(scope.$index) && !scope.row.edit"
                     @click="updatedRow(scope.$index)"
                     type="primary"
                     size="mini"
                     plain>修改</el-button>
          <el-button v-if="scope.row.edit"
                     @click="save(scope.$index)"
                     type="success"
                     size="mini"
                     plain>保存</el-button>
          <el-button v-if="scope.row.edit"
                     @click="cancle(scope.$index)"
                     size="mini"
                     plain>取消</el-button>
          <el-button v-if="!scope.row.edit"
                     @click="deleteHandle(scope.$index)"
                     type="danger"
                     size="mini"
                     plain>删除</el-button>
        </template>
      </el-table-column>
      <slot></slot>
    </el-table>
    <h3 style="margin:20px 0 0 0">表选择</h3>
    <el-table ref="tables"
              :data="paramTable"
              border
              fit
              highlight-current-row
              stripe
              @selection-change="handleSelectionChangeTable"
              style="width: 100%;">
      <el-table-column type="selection"
                       width="55">
      </el-table-column>
      <el-table-column label="表id"
                       align="center"
                       width="150">
        <template slot-scope="scope">
          <span>{{scope.row.tableId}}</span>
        </template>
      </el-table-column>
      <el-table-column label="表名"
                       align="center">
        <template slot-scope="scope">
          <span>{{scope.row.tableName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述"
                       align="center">
        <template slot-scope="scope">
          <span>{{scope.row.tableDesc}}</span>
        </template>
      </el-table-column>
    </el-table>
    <template v-if="configMode === '1'">
      <el-autocomplete v-model="addTableParam.tableName"
                       :fetch-suggestions="querySearchAsync"
                       placeholder="添加表"
                       @select="handleAutoSelect"
                       style="width: 400px;margin-top:30px;">
        <template slot-scope="{ item }">
          <div class="name">{{ item.tableName }}</div>
          <span class="desc">{{ item.tableDesc }}</span>
        </template>
      </el-autocomplete>
      <el-button type="warning"
                 icon="el-icon-plus"
                 size="mini"
                 @click="appendTable"
                 style="margin-top:30px;"></el-button>
    </template>
  </div>
</template>

<script>
const options = [{
  label: 'BaseDomain',
  value: 'com.fascte.basic.domain.BaseDomain'
},
{
  label: 'String',
  value: 'java.lang.String'
},
{
  label: 'Long',
  value: 'java.lang.Long'
},
{
  label: 'BigDecimal',
  value: 'java.math.BigDecimal'
},
{
  label: 'Date',
  value: 'java.util.Date'
},
{
  label: 'Map',
  value: 'java.util.Map'
},
{
  label: 'Object',
  value: 'java.lang.Object'
}]
import treeToArray from './eval'
import { baseRequest } from '@/api/base'
export default {
  name: 'treeTable',
  props: {
    data: {
      type: [Array, Object],
      required: true
    },
    paramTable: Array,
    columns: {
      type: Array,
      default: () => []
    },
    parameterType1: [Number, String],
    dialogStatus: String,
    configMode: [Number, String],
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      type: Boolean,
      default: true
    }
  },
  filters: {
    changeLabel(val) {
      return options.find(item => item.value === val) ? options.find(item => item.value === val).label : null
    }
  },
  data() {
    return {
      isOperating: false,
      isUpdate: false,
      multipleSelection: [],
      addTableParam: {},
      multipleSelectionTable: [],
      selectOptions: options
    }
  },
  computed: {
    // 格式化数据源
    formatData: function() {
      let tmp
      if (!Array.isArray(this.data)) {
        tmp = [this.data]
      } else {
        tmp = this.data
      }
      const func = this.evalFunc || treeToArray
      const args = this.evalArgs ? Array.concat([tmp, this.expandAll], this.evalArgs) : [tmp, this.expandAll]
      return func.apply(null, args)
    },
    parameterType: function() {
      return this.parameterType1 + ''
    }
  },
  mounted() {
    this.getSelect()
  },
  methods: {
    showRow: function(row) {
      const show = (row.row.parent ? (row.row.parent._expanded && row.row.parent._show) : true)
      row.row._show = show
      return show ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;' : 'display:none;'
    },
    // 切换下级是否展开
    toggleExpanded: function(trIndex) {
      const record = this.formatData[trIndex]
      record._expanded = !record._expanded
      this.$nextTick(function() {
        this.getSelect()
      })
    },
    // 点击添加子节点
    addChildren: function(trIndex) {
      if (this.isOperating) return
      this.isOperating = true
      const record = this.formatData[trIndex]

      const _level = record._level + 1
      const newChild = {
        fieldDesc: '',
        fieldName: '',
        fieldType: '',
        parent: record,
        _expanded: false,
        _level: _level,
        _show: false,
        edit: true,
        isMap: true,
        isAdd: true,
        checked: '0'
      }
      this.formatData.splice(trIndex + 1, 0, newChild)
      if (record.children) {
        record.children.unshift(newChild)
      } else {
        record.children = [newChild]
      }
      this.$nextTick(function() {
        this.getSelect()
      })
      record._expanded = true
      // if (record.checked === '1') {
      //   this.$refs.multipleTable.toggleRowSelection(record, true)
      // }
    },
    // 点击添加
    addBro: function() {
      if (this.isOperating) return
      this.isOperating = true
      const newBro = {
        fieldDesc: '',
        fieldName: '',
        fieldType: '',
        _expanded: false,
        _level: 1,
        _show: false,
        edit: true,
        isMap: true,
        isAdd: true
      }
      this.formatData.unshift(newBro)
    },
    // 修改操作
    updatedRow(trIndex) {
      if (this.isOperating) return
      this.isOperating = true
      this.isUpdate = true
      const record = this.formatData[trIndex]
      this.$set(record, 'edit', true)
      // record.edit = true
      // this.$refs.multipleTable.toggleRowExpansion(record)
      this.$set(record, 'fieldNameOri', record.fieldName)
      this.$set(record, 'fieldTypeOri', record.fieldType)
      this.$set(record, 'fieldDescOri', record.fieldDesc)
    },
    // 保存
    save(trIndex) {
      this.isOperating = false
      const record = this.formatData[trIndex]
      // const record1 = this.formatData[trIndex - 1]
      record.edit = false
      // if (this.isUpdate) {
      //   this.$refs.multipleTable.toggleRowExpansion(record)
      // }
      record.isAdd = false
      this.isUpdate = false
      this.$nextTick(function() {
        this.getSelect()
      })
    },
    // 取消
    cancle(trIndex) {
      this.isOperating = false
      this.isUpdate = false
      const record = this.formatData[trIndex]
      const recordPar = this.formatData[trIndex - 1]
      if (record.isAdd) {
        this.formatData.splice(trIndex, 1)
        recordPar.children.splice(0, 1)
        this.$nextTick(function() {
          this.getSelect()
        })
      } else {
        record.edit = false
        this.$set(record, 'fieldName', record.fieldNameOri)
        this.$set(record, 'fieldType', record.fieldTypeOri)
        this.$set(record, 'fieldDesc', record.fieldDescOri)
      }
      // this.$refs.multipleTable.toggleRowExpansion(record)
      this.$nextTick(function() {
        this.getSelect()
      })
    },
    // 删除
    deleteHandle(trIndex) {
      if (this.isOperating) return
      const record = this.formatData[trIndex]
      let count = 1
      for (let x = trIndex + 1; x < this.formatData.length; x++) {
        if (this.formatData[x]._level > record._level) {
          count++
        } else {
          break
        }
      }
      this.formatData.splice(trIndex, count)
      let childrenCount = 0
      let parentNode = null
      for (let x = trIndex - 1; x >= 0; x--) {
        if (this.formatData[x]._level < record._level) {
          parentNode = this.formatData[x]
          break
        } else if (this.formatData[x]._level === record._level) {
          childrenCount++
          continue
        } else {
          break
        }
      }
      if (parentNode) {
        parentNode.children.splice(childrenCount, 1)
      } else {
        if (record.fieldName === this.data[this.data.length - 1].fieldName) {
          this.data.pop()
        }
      }
      this.$nextTick(function() {
        this.getSelect()
      })
    },
    // 判断能否修改
    canUpdate(trIndex) {
      return true
      // if (this.parameterType === '1') return true
      // if (this.formatData[trIndex].isMap) { return true } else { return false }
      //  else { return false }
      // return this.findParent(this.formatData[trIndex].parent)
    },
    // 寻找父节点判断修改
    findParent(row) {
      if (row) {
        if (row.isMap) {
          return true
        } else {
          if (row.parent) {
            this.findParent(row.parent)
          } else {
            return false
          }
          return false
        }
      } else {
        return false
      }
    },
    // 记录选中行
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 图标显示
    iconShow(record) {
      return record.children && record.children.length > 0
    },
    selectAll(selection) {
      for (const iterator of this.formatData) {
        iterator.checked = selection.length > 0 ? '1' : '0'
      }
    },
    // 选中父子控制
    checkedSelect(selection, row) {
      if (selection.find(function(value, index, arr) { return value === row })) {
        row.checked = '1'
        this.findParent2(row)
      } else {
        row.checked = '0'
        this.findChildren2(row)
      }
    },
    // 选中勾选父节点
    findParent2(row) {
      if (row.parent) {
        row.parent.checked = '1'
        this.$refs.multipleTable.toggleRowSelection(row.parent, true)
        this.findParent2(row.parent)
      }
    },
    // 取消去勾子节点
    findChildren2(row) {
      if (row.children) {
        for (const iterator of row.children) {
          iterator.checked = '0'
          this.$refs.multipleTable.toggleRowSelection(iterator, false)
          this.findChildren2(iterator)
        }
      }
    },
    // 自动补全
    querySearchAsync(queryString, cb) {
      if (queryString === '' || queryString === undefined) return
      const param = { queryString }
      baseRequest('/basic/resource/autoGetTable', param).then(response => {
        cb(response.data.item)
      })
    },
    // 补全赋值
    handleAutoSelect(item) {
      this.addTableParam = item
    },
    // 区全赋值到列表
    appendTable() {
      if (this.addTableParam.tableName === '' || !this.addTableParam.tableId) return
      this.paramTable.push(this.addTableParam)
      this.addTableParam = {}
    },
    // 补全同步勾选
    handleSelectionChangeTable(val) {
      this.multipleSelectionTable = val
    },
    // 选中
    getSelect(num) {
      for (const iterator of this.formatData) {
        if (iterator.checked === '1') {
          this.$refs.multipleTable.toggleRowSelection(iterator, true)
        }
      }
      for (const iterator of this.paramTable) {
        if (iterator.checked === '1') {
          this.$refs.tables.toggleRowSelection(iterator, true)
        }
      }
    },
    // 父组件调用
    getParamsMenu() {
      const allMenu = this.objDeepCopy(this.formatData)
      // const newMenu = this.objDeepCopy(this.multipleSelection)
      // for (const it of allMenu) {
      //   let boo = false
      //   for (const it2 of newMenu) {
      //     if (it.feildId === it2.feildId &&
      //                   it.fieldName === it2.fieldName &&
      //                   it._level === it2._level &&
      //                   it.fieldType === it2.fieldType &&
      //                   it.fieldDesc === it2.fieldDesc) {
      //       boo = true
      //     }
      //   }
      //   if (boo || it.parentCheck === '1') {
      //     it.checked = '1'
      //   } else {
      //     it.checked = '0'
      //   }
      // }
      console.log(allMenu)
      for (const iterator of allMenu) {
        iterator.fieldDesc = typeof (iterator.fieldDesc) === 'string' ? iterator.fieldDesc : null
        iterator.columnId = typeof (iterator.columnId) === 'number' ? iterator.columnId : null
      }
      // console.log(allMenu)
      // this.pushInParent(newMenu)
      // const menuTree = []
      // for (const iterator of newMenu) {
      //   if (iterator._level === 1) {
      //     menuTree.push(iterator)
      //   }
      // }

      this.pushInParent(allMenu)
      const menuTreeAll = []
      for (const iterator of allMenu) {
        if (iterator._level === 1) {
          menuTreeAll.push(iterator)
        }
      }
      // this.deleteTree(menuTree)
      this.deleteTree(menuTreeAll)

      const tablesParam = []
      for (const iterator of this.multipleSelectionTable) {
        tablesParam.push(iterator.tableId)
      }
      for (const it of this.paramTable) {
        let isChecked = false
        for (const it2 of this.multipleSelectionTable) {
          if (it.tableId === it2.tableId) {
            isChecked = true
          }
        }
        if (isChecked) {
          it.checked = '1'
        } else {
          it.checked = '0'
        }
      }
      const result = {
        tablesParam, menuTreeAll
      }
      return result
    },
    deleteTree(data) {
      for (const iterator of data) {
        delete iterator.edit
        delete iterator.isAdd
        delete iterator._expanded
        delete iterator._level
        delete iterator._show
        delete iterator.parent
        if (iterator.children && iterator.children.length > 0) {
          this.deleteTree(iterator.children)
        }
      }
    },
    pushInParent(newMenu) {
      for (const it of newMenu) {
        if (it.parent) {
          for (const it2 of newMenu) {
            if (it2.fieldDesc === it.parent.fieldDesc &&
              it2.fieldName === it.parent.fieldName &&
              it2.fieldType === it.parent.fieldType &&
              it2._expanded === it.parent._expanded &&
              it2._level === it.parent._level
            ) {
              if (it2.children) {
                it2.children.push(it)
              } else {
                it2.children = [it]
              }
            }
          }
        }
      }
    },
    objDeepCopy(source) {
      var sourceCopy = source instanceof Array ? [] : {}
      for (var item in source) {
        if (item !== 'children') {
          sourceCopy[item] = typeof source[item] === 'object' ? this.objDeepCopy(source[item]) : source[item]
          if (item === 'columnId' || item === 'fieldDesc') {
            sourceCopy[item] = typeof sourceCopy[item] === 'object' ? null : sourceCopy[item]
          }
        }
      }
      return sourceCopy
    },
    renderHeader(h) {
      // if (this.parameterType === '1') {
      //   return (
      //     <div>
      //       <span>操作 </span>
      //       <el-button onClick={this.addBro} type='warning' icon='el-icon-plus' size='mini'></el-button>
      //     </div>
      //   )
      // } else {
      return (
        <div>
          <span>操作</span>
        </div>
      )
      // }
    }
  }
}
</script>
<style rel="stylesheet/css">
@keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<style lang="scss" rel="stylesheet/scss" scoped>
$color-blue: #2196f3;
$space-width: 18px;
.ms-tree-space {
  position: relative;
  top: 1px;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  width: $space-width;
  height: 14px;
  &::before {
    content: "";
  }
}
.processContainer {
  width: 100%;
  height: 100%;
}
table td {
  line-height: 26px;
}

.tree-ctrl {
  position: relative;
  cursor: pointer;
  color: $color-blue;
  margin-left: -$space-width;
}
</style>
