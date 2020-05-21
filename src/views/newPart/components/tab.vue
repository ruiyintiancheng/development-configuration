<template>
  <div>
    <div class="base-row base-row-self">
      <div class="row-botton clearfix">
        <div class="row-title">
          <span>sql输入框</span>
        </div>
        <div class="row-option">
          <a @click="sqlUp"
             v-if="sqlShow">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="sqlDown"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <div class="sqlArea"
           v-show="sqlShow">
        <div class="sqlInputDiv">
          <sql-input :contentHeight="sqlInpuDefaultHeight[1]"
                     :code="code"
                     ref="sql"
                     :id="'id'+ id"
                     :dataSourceCondition='dataSourceCondition'></sql-input>
        </div>
        <div class="sql-button">
          <div style="float: left; font-size: 14px;">{{resultMessage}}</div>
          <el-button class="sqlButton"
                     icon="el-icon-search"
                     @click="searchOptionSql"
                     type="primary"
                     size="small">查询</el-button>
          <el-button class="sqlButton"
                     icon="el-icon-search"
                     @click="searchOptionColumn"
                     type="primary"
                     size="small">查询列</el-button>
          <el-button class="sqlButton"
                     icon="el-icon-refresh"
                     @click="resetSql"
                     size="small">重置</el-button>
          <el-button class="sqlButton"
                     type="primary"
                     @click="formatterSql"
                     size="small">格式化</el-button>
        </div>
      </div>
    </div>
    <div class="base-row tableList">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-button v-if="nodeType == '3'">加载更新</el-button>
          <a @click="tableUp"
             v-if="tableShow">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableDown"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <div v-show="tableShow">
        <el-table :data="tableData"
                  class="tb-edit"
                  :border="true"
                  :fit="true"
                  :height="tableDataH"
                  :max-height="tableDataH"
                  :empty-text="resultMessage"
                  style="width: 100%;">
          <!-- <el-table-column  type="index" :index="(index) => {return (currentPage - 1) * pageSize + index + 1}" > </el-table-column> -->
          <el-table-column v-for="item in tableHead"
                           :label="item.label"
                           :property="item.property"
                           :key="item.aaa"
                           width="180"> </el-table-column>
        </el-table>
        <el-pagination background
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="currentPage"
                       :page-sizes="[10,20,30,50]"
                       :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
        <!--  hide-on-single-page -->
      </div>
    </div>
  </div>
</template>

<script>
import { baseRequest } from '@/api/base'
import sqlInput from './sqlInput'
const url = '/basic/sqlExecute/selectBySql'// 执行sql

export default {
  components: {
    sqlInput
  },
  props: {
    id: String,
    code: String,
    dataSourceCondition: Object
  },
  data() {
    return {
      sqlShow: true,
      sqlInpuDefaultHeight: ['150px', '150px'], // sql输入框高度
      //   sqlMessage: 'test',

      tableShow: false,
      tableDataH: '150px',
      tableData: [], // 表数据
      tableHead: [], // 表头
      dataListDefaultHeight: ['150px', '150px'], // 数据列表高度

      resultMessage: '', // 提示信息
      nodeType: '1',

      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  },
  created() {
    this.sqlInpuDefaultHeight[0] = '150px'
    this.sqlInpuDefaultHeight[1] = (this.$store.state.app.containHeight - 260) + 'px'
    this.dataListDefaultHeight[0] = (this.$store.state.app.containHeight - 410) + 'px'
    this.dataListDefaultHeight[1] = (this.$store.state.app.containHeight - 215) + 'px' // 180
  },
  methods: {
    searchOptionSql() { // sql编辑框sql的执行
      this.currentPage = 1
      this.getData()

      this.tableDataH = this.dataListDefaultHeight[0]
      this.tableDown()
    },
    searchOptionColumn() {
      this.$refs.sql.showColumns()
    },
    getData() {
      var text = this.$refs.sql.getSql()

      var param = {
        sql: text,
        name: this.dataSourceCondition.name,
        datSourceType: this.dataSourceCondition.datSourceType,
        dataSourceCode: this.dataSourceCondition.dataSourceCode,
        dataSourceName: this.dataSourceCondition.dataSourceName,
        dsCode: this.dataSourceCondition.dataSourceCode,
        pageSize: this.pageSize,
        pageNo: this.currentPage
      }

      baseRequest(url, param).then(response => {
        const result = response.data.item
        this.tableData = result.tableData // 表数据
        this.tableHead = result.tableHead// 表头
        this.resultMessage = result.resultMessage// 提示信息

        // this.resultMessage = '共查到100条'
        this.total = result.count
        // this.total = 100
      })
    },
    resetSql() { // sql编辑框sql的格式化
      this.$refs.sql.reset('')
    },
    formatterSql() {
      this.$refs.sql.formatter()
    },

    sqlUp() { // sql输入框收起
      this.sqlShow = false
      this.tableDataH = this.dataListDefaultHeight[1]
    },
    sqlDown() { // sql输入框展开
      this.sqlShow = true
      this.tableDataH = this.dataListDefaultHeight[0]
    },
    tableUp() { // 数据列表收起
      this.tableShow = false
      this.$refs.sql.setSqlnputCss('', this.sqlInpuDefaultHeight[1])
    },
    tableDown() { // 数据列表展开
      this.tableShow = true
      this.$refs.sql.setSqlnputCss('', this.sqlInpuDefaultHeight[0])
    },
    // 表格分页
    handleSizeChange(val) {
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // this.searchOptionSql(ref)
      this.getData()
    }
  }
}
</script>

<style scoped>
.app-container .code-tree {
  margin-top: 5px;
  overflow: auto;
  position: relative;
  border: 1px solid #e4e4e4;
}
.app-container .sqlWindow .base-row-self {
  margin: 5px 0;
}
.app-container .sqlWindow {
  margin: 5px 15px;
}
.is-top {
  margin: 5px 15px;
  margin-left: 60px;
}
.app-container .sqlWindow .tableList {
  margin: 0;
}
/* .sqlButton{
      margin-right: 0px;

    } */
.app-container .sqlWindow .sqlArea .sql-button {
  text-align: right;
  padding: 5px;
}
.my-col {
  height: 100%;
  float: left;
  overflow: hidden;
  transition: width 0.28s linear 0s;
}
.my-col-button {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
.botton-body {
  width: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>

