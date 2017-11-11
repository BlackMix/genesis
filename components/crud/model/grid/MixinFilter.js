import { clone } from 'phpzm/support/utils'

export default {
  props: {
    rule: {
      type: String,
      default: () => ''
    },
    separator: {
      type: String,
      default: () => ''
    }
  },
  data: () => ({
    filter: {
      active: false,
      columns: [],
      record: {},
      rules: {},
      css: {
        padding: '0',
        height: '100vh',
        maxHeight: '100vh',
        width: '30vw',
        maxWidth: '30vw',
        borderRadius: '0'
      }
    }
  }),
  methods: {
    /**
     */
    filterOpen () {
      this.$refs.filter.open()
    },
    /**
     */
    filterClose () {
      window.setTimeout(this.$refs.filter.close, this.timeout)
    },
    /**
     */
    filterApply () {
      const query = this.$route.query

      Object.keys(this.filter.record).forEach(key => (delete query[key]))

      Object.keys(this.filter.record).forEach(key => {
        let value = this.filter.record[key]
        if (value === undefined) {
          return
        }
        if (typeof value === 'string' && value.length === 0) {
          return
        }
        if (typeof value === 'boolean') {
          value = value ? '1' : '0'
        }
        query[key] = value
      })

      this.browse(this.path, query)
    },
    /**
     */
    filterClear () {
      const query = this.$route.query
      Object.keys(this.filter.record).forEach(key => delete query[key])
      this.browse(this.path, query)
    },
    /**
     * @param {Object} column
     * @returns {Object}
     */
    mapFilters (column) {
      column.width = 100
      column.component = this.componentName(column.filter.component)
      column.value = column.filter.value
      column.rule = column.filter.rule || this.rule
      delete column.filter
      return column
    },
    /**
     * @param {Object} accumulate
     * @param {Object} filter
     * @returns {Object}
     */
    reduceFiltersRecord (accumulate, filter) {
      accumulate[filter.field] = filter.value
      return accumulate
    },
    /**
     * @param {Object} accumulate
     * @param {Object} filter
     * @returns {Object}
     */
    reduceFiltersRules (accumulate, filter) {
      accumulate[filter.field] = filter.rule
      return accumulate
    },
    /**
     */
    renderFilters () {
      const columns = clone(this.columns)
      columns.shift()

      const map = item => {
        item.grid.component = this.componentName(item.form.component)
        return item
      }

      const filterColumns = columns.filter(column => column.filter).map(this.mapFilters)
      const filterAdditional = this.filters.map(map).filter(this.filterColumns).map(this.mapColumns)

      const filters = []
      filters.push(...filterColumns)
      filters.push(...filterAdditional)

      this.filter.columns = filters

      this.filter.record = this.filter.columns.reduce(this.reduceFiltersRecord, {})
      this.filter.rules = this.filter.columns.reduce(this.reduceFiltersRules, {})
    },
    /**
     * @param {*} value
     * @param {string} separator
     * @returns {*}
     */
    clearFilter (value, separator) {
      if (value === undefined) {
        return value
      }
      if (!separator) {
        return value
      }
      const split = String(value).split(separator)
      if (split.length < 2) {
        return value
      }
      split.shift()
      return split.join(separator)
    },
    /**
     */
    loadFilters () {
      const record = Object.keys(this.filter.record).reduce((accumulate, key) => {
        const value = this.clearFilter(this.$route.query[key], this.separator)
        if (value !== undefined) {
          accumulate[key] = value
        }
        return accumulate
      }, {})
      this.filter.record = record
      this.filter.active = !!Object.keys(record).length
    }
  }
}
