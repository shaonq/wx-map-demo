/*
 * @route pages/index/index
 * @author shaonq@qq.com
 */
var app = getApp();
import servers from '../../utils/servers';

var markersParentIndex = null; // 一级 markers 索引

Page({
  data: {
    scale: 5,
    longitude: "113.324520",
    latitude: "23.099994",
    userInfo: {}, // 用户信息
    markers: [],  // 一级 markers
    markersEye: [], // 可是 markers
    markerData: [],  // markers 原始数据
    controls: [
      /**
       *  1 =>  that.resetMap()
       */
    ] // 控件
  },
  tap(e) {

  },
  // console.log("视野发生变化时触发", e)
  regionchange(e) {

  },
  markertap(e) {
    console.log("点击标记点时触发", e.markerId)
  },
  // "点击控件时触发",)
  controltap(e) {
    var that = this;
    switch (e.controlId) {
      case 1:
        that.resetMap();
        break
    }
  },
  //点击标记点对应的气泡时触发
  callouttap(e) { 
    // e.markerId 对应气泡的id
    var that = this, markerId = e.markerId ,markerData = that.data.markerData;
    console.log(markersParentIndex, markerId)
    if (markersParentIndex === null) {
      var subData = (markerData[markerId] || {}).subDistricts || [];
      var markers = subData.map((item, index) => {
        return item._index = index, that.creatMarkers(item, true)
      });
      markers.length ? (markersParentIndex = markerId,that.setData({
        markersEye: markers,
        markers: markers,
        controls: [{
          id: 1,
          iconPath: '/resources/icon-index.png',
          position: { left: 20, top: 20 },
          clickable: true
        }]
      })) : wx.showModal({ title: '没有数据' })
    } else {
      var subData = (markerData[markersParentIndex] || {}).subDistricts || [];
      var d = subData[markerId];
      /*  wx.showModal({
          title: '当前坐标',
          content: '名称: ' + d.name +   '坐标: ' + d.center +' 数据: '+d.count,
          success: function (res) {
            if (res.confirm) {
              //   console.log('用户点击确定')
            } else if (res.cancel) {
              //  console.log('用户点击取消')
            }
          }
        }); */
        wx.showActionSheet({
          itemList: ['名称: ' + d.name , '坐标: ' + d.center , ' 数据: ' + d.count],
          success: function (res) {
            console.log(res.tapIndex)
          },
          fail: function (res) {
            console.log(res.errMsg)
          }
        })
    }
  },
  // 获取数据
  creatMarkers(options, sub = false) {
    var latLon = options.center.split(',')
    var len = options.subDistricts ? options.subDistricts.length : 0;
    return {
      iconPath: sub ? "/resources/icon-marker-sub.png" : "/resources/icon-marker.png",
      id: options._index,
      latitude: latLon[1],
      longitude: latLon[0],
      width: 32,
      height: 32,
      callout: {
        content: '<text class="map-callout">' + options.name + (sub ? "" : "(" + len.toString() + ")") + '</text>',
        borderRadius: 3,
        color: '#fff',
        bgColor: sub ? '#339933' : '#09f',
        boxShadow: '0 3px 6px rgba(0,0,0,.3)',
      }
    }
  },
  resetMap() {
    var that = this;
    markersParentIndex = null;
    that.setData({
      controls: [],
      markersEye: [],
      markers: that.data.markerData.map((item, index) => {
        return item._index = index, that.creatMarkers(item)
      })
    })
  },
  getDatas() {
    var that = this
    wx.showToast({
      icon: 'loading',
      title: '加载中'
    })
    wx.request({
      url: servers.getMarkers,
      complete: (d) => {
        wx.hideToast()
        d.statusCode === 200 ?
          (that.setData({ markerData: d.data }), that.resetMap()) :
          wx.showToast({
            title: 'Error:code:' + d.statusCode
          })
      }
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
    this.getDatas();
  }
})
