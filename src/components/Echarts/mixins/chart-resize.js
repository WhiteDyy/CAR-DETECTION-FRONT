export default {
  data() {
    return {
      isChartUpdating: false,
      chartResizeListener: null,
      isDestroying: false,
      resizeTimer: null, // 添加防抖计时器
    }
  },
  methods: {
    chartEleResizeListener() {
      this.chartResizeListener = ResizeListener({
        strategy: 'scroll',
        callOnAdd: true,
      })

      this.chartResizeListener.listenTo(this.$el, () => {
        if (!this.chart)
          return

        // 添加防抖
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer)
        }

        this.resizeTimer = setTimeout(() => {
          this.$nextTick(() => {
            if (this.isDestroying || !this.chart || this.isChartUpdating)
              return

            try {
              if (!this.chart
                || typeof this.chart.isDisposed === 'function' && this.chart.isDisposed()
                || !this.chart._dom
                || typeof this.chart.resize !== 'function') {
                return
              }

              // 确保图表未被销毁后再调用 resize
              if (!this.chart.isDisposed()) {
                this.chart.resize()
              }
            }
            catch (resizeError) {
              console.warn('ECharts resize failed, but continuing:', resizeError)
              // 这里可以选择重新初始化图表
              this.reinitChart()
            }
          })
        }, 100) // 100ms防抖
      })
    },

    // 添加图表重新初始化方法
    reinitChart() {
      if (this.chart && typeof this.chart.dispose === 'function') {
        this.chart.dispose()
      }
      this.$nextTick(() => {
        this.initChart()
      })
    },
  },
  beforeDestroy() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
    // 清理 element-resize-detector 监听器
    if (this.chartResizeListener && this.$el) {
      this.chartResizeListener.uninstall(this.$el)
      this.chartResizeListener = null
    }

    window.removeEventListener('resize', this.windowResizeListener)

    // 设置销毁状态标志
    this.isDestroying = true
  },
}
