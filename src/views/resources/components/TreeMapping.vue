<template>
<div>
  <el-table :data="formatData" :row-style="showRow" v-bind="$attrs">
    
    <el-table-column  label="参数名">
      <template slot-scope="scope">
        <template>
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
        <template>
        {{scope.row.fieldType}}
       </template>
      </template>
    </el-table-column>
    <el-table-column  label="参数描述">
      <template slot-scope="scope">
        <template>
        {{scope.row.fieldDesc}}
        </template>
      </template>
    </el-table-column>
    <el-table-column  label="对应字段id">
      <template slot-scope="scope">
        <template>
        {{scope.row.columnId}}
        </template>
      </template>
    </el-table-column>
    <el-table-column align="center" prop="checked" label="操作" :filter-method="filterHandler" :filters="[{ text: '选中', value: '1' }, { text: '未选中', value: '0' }]" :filtered-value="['1']">
      <template slot-scope="scope">
        <el-button size="mini" v-if="scope.row.checked === '1' && !scope.row.children" @click="feildMapping(scope.row)">字段映射</el-button>
      </template>
    </el-table-column> 
    <!-- <el-table-column  label="是否选中" prop="checked" :filter-method="filterHandler" :filters="[{ text: '1', value: '1' }, { text: '0', value: '0' }]" :filtered-value="['1']"></el-table-column> -->
  </el-table>
  <el-dialog title="字段映射" :visible.sync="dialogForMapping" v-el-drag-dialog :close-on-click-modal="false" width="35%" append-to-body>
    <el-tree
                :data="formatMapping"
                default-expand-all
                node-key="columnId"
                show-checkbox
                ref="tree"
                highlight-current
                :expand-on-click-node="false"
                :default-checked-keys="checkedColumnId"
                :props="defaultProps"
                @check = "checkedEvent"
               >
               <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                  <span class="custom-tree-desc">
                    {{data.desc}}
                  </span>
                </span>
            </el-tree>
            <div slot="footer" class="dialog-footer">
          <el-button @click="dialogForMapping = false">取消</el-button>
          <el-button type="primary" @click="getMapingId">保存</el-button>
        </div>
  </el-dialog>
</div>
</template>

<script>
import treeToArray from './eval'
export default {
  name: 'treeMapping',
  props: {
    data: {
      type: Array,
      required: true
    },
    mappingTreeData: Array,
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      type: Boolean,
      default: true
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
    formatMapping: function() {
      var mappingTree = []
      for (const iterator of this.mappingTreeData) {
        for (const key in iterator) {
          const tempObj = {
            name: key,
            disabled: true,
            children: []
          }
          for (const it2 of iterator[key]) {
            const obj = {
              name: it2.fieldName,
              desc: it2.fieldDecs,
              columnId: it2.columnId
            }
            tempObj.children.push(obj)
          }
          mappingTree.push(tempObj)
        }
      }
      return mappingTree
    }
  },
  data() {
    return {
      dialogForMapping: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      index: null,
      checkedColumnId: []
    }
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
    },
    // 图标显示
    iconShow(record) {
      return record.children && record.children.length > 0
    },
    feildMapping(row) {
      this.index = row
      // const t_data = this.formatData[this.index]
      const t_data = row
      let t_arr = []
      if (t_data.columnId && t_data.columnId !== '') {
        t_arr.push(t_data.columnId)
      } else {
        t_arr = []
      }
      this.checkedColumnId = t_arr
      this.dialogForMapping = true
      this.$refs.tree.setCheckedKeys(t_arr, true)
    },
    checkedEvent(obj, arr) {
      if (arr.checkedKeys.find(function(value, index, arr) { return value === obj.columnId })) {
        this.$refs.tree.setCheckedKeys([obj.columnId], true)
      }
    },
    getMapingId() {
      const keys = this.$refs.tree.getCheckedKeys(true)
      this.dialogForMapping = false
      if (keys.length > 0) {
        this.index.columnId = keys[0]
      } else {
        this.index.columnId = null
      }
    },
    // 过滤未选中
    filterHandler(value, row) {
      return row.checked === value
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

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .custom-tree-desc{
    color: #b4b4b4;
  }
</style>
