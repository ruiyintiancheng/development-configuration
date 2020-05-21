<template>
  <div class="resource-tree">
            <el-table ref="multipleTable" stripe  :data="formatData" :row-style="showRow" v-bind="$attrs" @select="checkedSelect" @selection-change="handleSelectionChange">
                  <el-table-column
                    type="selection"
                    width="55">
                  </el-table-column>
                  <el-table-column  label="参数名">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.edit" class="edit-input" size="small" placeholder="参数名" v-model="scope.row.fieldName"></el-input>
                      <template v-else>
                        <span v-for="space in scope.row._level" class="ms-tree-space" :key="space"></span>
                      <span class="tree-ctrl" v-if="iconShow(scope.row)" @click="toggleExpanded(scope.$index)">
                        <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
                        <i v-else class="el-icon-minus"></i>
                      </span>  
                        {{ scope.row.fieldName }}
                        </template>
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数类型">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.edit" class="edit-input" size="small" placeholder="参数类型" v-model="scope.row.fieldType"></el-input>
                      <template v-else>
                      {{scope.row.fieldType}}
                    </template>
                    </template>
                  </el-table-column>
                  <el-table-column  label="参数描述">
                    <template slot-scope="scope">
                      <el-input v-if="scope.row.edit" class="edit-input" size="small" placeholder="参数描述" v-model="scope.row.fieldDesc"></el-input>
                      <template v-else>
                      {{scope.row.fieldDesc}}
                      </template>
                    </template>
                  </el-table-column>
                  <el-table-column  align="center" :render-header="renderHeader">
                      <template slot-scope="scope">
                          <el-button v-if="scope.row.isMap && !scope.row.edit" @click="addChildren(scope.$index)" size="mini">添加</el-button>
                          <el-button v-if="canUpdate(scope.$index) && !scope.row.edit" @click="updatedRow(scope.$index)" type="primary" size="mini">修改</el-button>
                          <el-button v-if="scope.row.edit" @click="save(scope.$index)" type="success"  size="mini">保存</el-button>
                          <el-button v-if="scope.row.edit" @click="cancle(scope.$index)" size="mini">取消</el-button>
                      </template>
                  </el-table-column> 
                </el-table>
      </div>
</template>

<script>

import treeToArray from './eval'
export default {
  name: 'treeTable',
  props: {
    data: {
      type: [Array, Object],
      required: true
    },
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isOperating: false,
      isUpdate: false,
      multipleSelection: [],
      addTableParam: {},
      multipleSelectionTable: []
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
        isAdd: true
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
      record.edit = true
      this.$refs.multipleTable.toggleRowExpansion(record)
      record.fieldNameOri = record.fieldName
      record.fieldTypeOri = record.fieldType
      record.fieldDescOri = record.fieldDesc
    },
    // 保存
    save(trIndex) {
      this.isOperating = false
      const record = this.formatData[trIndex]
      // const record1 = this.formatData[trIndex - 1]
      record.edit = false
      if (this.isUpdate) {
        this.$refs.multipleTable.toggleRowExpansion(record)
      }
      record.isAdd = false
      this.isUpdate = false
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
        record.fieldName = record.fieldNameOri
        record.fieldType = record.fieldTypeOri
        record.fieldDesc = record.fieldDescOri
      }
      this.$refs.multipleTable.toggleRowExpansion(record)
    },
    // 判断能否修改
    canUpdate(trIndex) {
      if (this.formatData[trIndex].isMap) { return true }
      //  else { return false }
      return this.findParent(this.formatData[trIndex].parent)
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
    // 选中父子控制
    checkedSelect(selection, row) {
      if (selection.find(function(value, index, arr) { return value === row })) {
        this.findParent2(row)
      } else {
        this.findChildren2(row)
      }
    },
    // 选中勾选父节点
    findParent2(row) {
      if (row.parent) {
        this.$refs.multipleTable.toggleRowSelection(row.parent, true)
        this.findParent2(row.parent)
      }
    },
    // 取消去勾子节点
    findChildren2(row) {
      if (row.children) {
        for (const iterator of row.children) {
          this.$refs.multipleTable.toggleRowSelection(iterator, false)
          this.findChildren2(iterator)
        }
      }
    },
    // 选中
    getSelect() {
      for (const iterator of this.formatData) {
        if (iterator.checked === '1') {
          this.$refs.multipleTable.toggleRowSelection(iterator, true)
        }
      }
    },
    // 父组件调用
    getParamsMenu() {
      const allMenu = this.objDeepCopy(this.formatData)
      const newMenu = this.objDeepCopy(this.multipleSelection)
      for (const it of allMenu) {
        let boo = false
        for (const it2 of newMenu) {
          if (it.columnId === it2.columnId &&
                        it.fieldName === it2.fieldName &&
                        it.fieldType === it2.fieldType &&
                        it.fieldDesc === it2.fieldDesc) {
            boo = true
          }
        }
        if (boo) {
          it.checked = '1'
        } else {
          it.checked = '0'
        }
      }
      // this.pushInParent(newMenu)
      // const result = []
      // for (const iterator of newMenu) {
      //   if (iterator._level === 1) {
      //     result.push(iterator)
      //   }
      // }

      this.pushInParent(allMenu)
      const data = []
      for (const iterator of allMenu) {
        if (iterator._level === 1) {
          data.push(iterator)
        }
      }
      // this.deleteTree(result)
      this.deleteTree(data)
      // const temp = {
      //   result,
      //   data
      // }
      return data
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
        }
      }
      return sourceCopy
    },
    renderHeader(h) {
      return (
        <div>
          <span>操作 </span>
          <el-button onClick={this.addBro} type='warning' icon='el-icon-plus' size='mini'></el-button>
        </div>
      )
    }
  }
}
</script>
<style rel="stylesheet/css">
  @keyframes treeTableShow {
    from {opacity: 0;}
    to {opacity: 1;}
  }
  @-webkit-keyframes treeTableShow {
    from {opacity: 0;}
    to {opacity: 1;}
  }
</style>

<style lang="scss" rel="stylesheet/scss" scoped>
  $color-blue: #2196F3;
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
      content: ""
    }
  }
  .processContainer{
    width: 100%;
    height: 100%;
  }
  table td {
    line-height: 26px;
  }

  .tree-ctrl{
    position: relative;
    cursor: pointer;
    color: $color-blue;
    margin-left: -$space-width;
  }
</style>
