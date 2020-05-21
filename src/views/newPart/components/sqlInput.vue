<template>
  <div>
    <div v-show="columnInfo"
         :style="{'height': codeHeigth}"
         class='columnInfoSql'>
      <ul>
        <li v-for="(column, index) in columns"
            :key="index">{{column.displayText}}</li>
      </ul>
    </div>
    <!-- <el-button class="sqlButton" icon="el-icon-search" @click="searchOptionSql" type="primary" size="small">查询</el-button>
    {{selText}} -->
    <textarea :id="code"
              name="code"
              style="width:100%;height:100%;display:none"></textarea>
    <!-- <el-row :gutter="20" class="button">
          <el-col :span="2" offset="18"><el-button icon="el-icon-search" @click="searchOption" type="primary">查询</el-button></el-col>
          <el-col :span="2"><el-button icon="el-icon-refresh" @click="reset" >重置</el-button></el-col>
          <el-col :span="2"><el-button type="primary" @click="formatter">格式化</el-button></el-col>
        </el-row> -->
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/selection/active-line'
import 'codemirror/theme/blackboard.css'
import sqlFormatter from 'sql-formatter'
export default {
  components: {
    baseRequest,
    CodeMirror,
    sqlFormatter
  },
  props: {
    contentHeight: String,
    id: String,
    code: String,
    dataSourceCondition: Object
  },
  data() {
    return {
      selText: '',
      codeWidth: null, // sql编辑区域的宽
      codeHeigth: null, // sql编辑区域的高
      smartIndent: true,
      styleActiveLine: true,
      lineNumbers: true, // 显示行号
      lineWrapping: true, // 自动换行
      matchBrackets: true, // 括号匹配
      autofocus: true, // 自动获取焦点
      indentUnit: 2, // 缩进,默认为2
      abSize: 4, // tab字符的宽度，默认为4
      returnData: null, // 执行sql返回的数据
      editor: null,
      tables: null, // 数据源表字段信息
      columns: null,
      columnInfo: true
    }
  },
  methods: {
    getData() {
      // 出书画编辑区域
      const param = { dataSourceMessage: this.dataSourceCondition }
      param.dsCode = this.dataSourceCondition.dataSourceCode

      baseRequest('/basic/sqlExecute/getTablesAndColumns', param).then(response => {
        const data = response.data.item
        this.tables = data
        var mime = 'text/x-sql'
        this.editor = CodeMirror.fromTextArea(
          document.getElementById(this.code),
          {
            mode: mime, // 模型类型
            indentWithTabs: true,
            smartIndent: this.smartIndent, // 默认缩进
            styleActiveLine: this.styleActiveLine, // 当前行高亮
            lineNumbers: this.lineNumbers, // 显示行号
            lineWrapping: this.lineWrappingthis, // 自动换行
            matchBrackets: this.matchBrackets, // 括号匹配
            autofocus: this.autofocus, // 自动获取焦点
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            // theme: 'blackboard', // 编辑框的主题
            indentUnit: this.indentUnit, // 缩进,默认为2
            abSize: this.abSize, // tab字符的宽度，默认为4
            gutters: ['CodeMirror-lint-markers'],
            hintOptions: {
              tables: data
            }
          }
        )
        this.editor.on('keyup', function(cm, event) {
          // 所有的字母和'$','{','.'在键按下之后都将触发自动完成
          if (
            !cm.state.completionActive &&
            ((event.keyCode >= 65 && event.keyCode <= 90) ||
              event.keyCode === 52 ||
              event.keyCode === 219 ||
              event.keyCode === 190)
          ) {
            CodeMirror.commands.autocomplete(cm, null, {
              completeSingle: false
            })
          }
        })
        this.editor.on('cursorActivity', this.hiddenColumn)
        this.editor.on('dblclick', this.showColumn) // 双击事件
        this.editor.setSize(this.codeWidth, this.codeHeigth)
        // console.log(CodeMirror.hint.fromList)
      })
    },
    setSqlnputCss(width, height) {
      // 设置输入sql区域的大小
      // this.codeWidth = width
      this.codeHeigth = height
      this.editor.setSize(this.codeWidth, this.codeHeigth)
    },
    getConfig(faConfig, defaultConfig) {
      // 将子组件和父组件的配置进行整合
      if (typeof faConfig === 'undefined') {
        return defaultConfig
      } else {
        return faConfig
      }
    },
    formatter() {
      // 输入sql进行格式化
      this.editor.setValue(sqlFormatter.format(this.editor.getValue()))
    },
    getSql() {
      // 获取sql语句
      return this.editor.getValue()
    },
    reset(sqlValue) {
      // 设置sql编辑区域的值
      this.editor.setValue('')
    },
    searchOptionSql() {
      this.selText = this.editor.getSelection()
    },
    showColumn(cm) {
      const table = cm.getSelection()
      this.columns = this.tables[table]
    },
    showColumns() {
      const table = this.editor.getSelection()
      this.columns = this.tables[table]
    },
    hiddenColumn(cm) {
      // this.columnInfo = false
    }
  },

  mounted() {
    // 初始化编辑框的属性,调用的组件未传值的使用默认值
    this.smartIndent = this.$options.methods.getConfig(
      this.$parent.smartIndent,
      this.smartIndent
    )
    this.styleActiveLine = this.$options.methods.getConfig(
      this.$parent.styleActiveLine,
      this.styleActiveLine
    )
    this.lineNumbers = this.$options.methods.getConfig(
      this.$parent.lineNumbers,
      this.lineNumbers
    )
    this.lineWrapping = this.$options.methods.getConfig(
      this.$parent.lineWrapping,
      this.lineWrapping
    )
    this.matchBrackets = this.$options.methods.getConfig(
      this.$parent.matchBrackets,
      this.matchBrackets
    )
    this.autofocus = this.$options.methods.getConfig(
      this.$parent.autofocus,
      this.autofocus
    )
    this.indentUnit = this.$options.methods.getConfig(
      this.$parent.indentUnit,
      this.indentUnit
    )
    this.abSize = this.$options.methods.getConfig(
      this.$parent.abSize,
      this.abSize
    )
    this.codeWidth = this.$parent.codeWidth || 'calc(100% - 200px)'
    // this.codeWidth = this.$parent.codeWidth || '100%''
    // this.codeHeigth = this.$parent.codeHeigth || '150px'
    this.codeHeigth = this.$parent.codeHeigth || this.contentHeight
    // 创建编辑框
    // this.$options.methods.formatter()
    this.getData()
  }
}
</script>

<style>
.sqlInputDiv .CodeMirror {
  padding: 0;
  min-height: 150px;
}
.sqlInputDiv .CodeMirror .CodeMirror-scroll {
  min-height: 150px;
}
.columnInfoSql {
  width: 200px;
  min-height: 150px;
  background-color: white;
  border: 1px solid #ccc;
  font-size: 13px;
  padding: 5px;
  position: absolute;
  right: 0;
  z-index: 10;
  overflow-y: auto;
  overflow-x: auto;
}
.columnInfoSql > ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.columnInfoSql > ul > li {
  padding: 2px 0;
}
</style>


