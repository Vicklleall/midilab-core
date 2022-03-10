## midilab-core：轻量级Web数字音乐引擎

### 快速入门

#### 初始化

```js
await MidiLabCore.init();
```
后续操作都要在初始化后进行

#### 创建输出

创建新的输出通道：

```js
new MidiLabCore.Output();
```

输出通道通过 `MidiLabCore.res.output[i]` 访问，初始化时会创建默认输出 `MidiLabCore.res.output[0]`

控制输出音量：

```js
output[0].gain = 0.5;
```

#### 加载音频资源

```js
// MidiLabCore.res.loadBuffer(id, url)
MidiLabCore.res.loadBuffer('Piano-f', 'sample/Piano-f.ogg');
```

该函数返回一个 `Promise`，加载音频资源需要指定唯一id，作为后续对资源的索引

使用 `onBufferLoad` 添加音频加载后执行的回调函数（注意添加的函数在每次资源更新后都会执行）：

```js
MidiLabCore.res.onBufferLoad('Piano-f', buffer => { ... });
```

#### 创建乐器

```js
// new MidiLab.core.Instrument(outputId = 0);
const Piano = new MidiLabCore.Instrument();
```

创建乐器时可以指定输出通道，默认为0号输出

##### 添加组

一个乐器可以有多种演奏技巧、不同演奏力度的采样，因此需要分组

使用 `createGroup` 给乐器添加组：

```js
const group = Piano.createGroup();
group.gain = 0.7; // 设置组音量
```

设置组里音符的包络曲线：

```js
group.envelope.push(
  {type: 0, value: 1, time: 0.02},  // 经过0.02秒，音量线性增加到1
  {type: 1, value: 0.5, time: 0.5}, // 经过0.5秒，音量指数衰减到0.5
);
group.release = 0.5; // 设置音符释放后衰减时间为0.5秒
```

设置组的力度映射：

```js
// group.setDyn(start, mid, end);
group.setDyn(0, 63, 127);
```

这里设置响应的力度范围为0-127，63时为最大，也就是说从0-63，这个组的音量逐渐增加，63-127音量逐渐下降到0

> 例如，对于一个4层力度 (pp, p, f, ff) 的乐器，可以分别设置四个组的力度映射为 (0, 31, 63), (31, 63, 95), (63, 95, 127), (95, 127, 128)

MIDI制作中有两种常用的力度处理方案：对于单次演奏的音，在音符播放一开始就决定了力度，之后不再更改；对于连续长音，可以开启动态过渡，音符播放途中也可以调整力度，这样就能实现渐强音等效果。

```js
group.enableXFade();  // 开启动态过渡
group.disableXFade(); // 关闭动态过渡
```

##### 添加音符

```js
// new MidiLab.core.Instrument.Zone(src, root, tune, start, duration);
const zone = new MidiLabCore.Instrument.Zone('Piano-f', 60, 0, 4, 4);
```

`src` 设置音频源，对应前面 `loadBuffer` 加载资源的id

`root` 指定这个音符是哪个音，音符代码可以使用工具函数获得：

```js
MidiLabCore.utils.note('C4')  // 60
MidiLabCore.utils.note('#F5') // 78
MidiLabCore.utils.note('bB2') // 34
```

`tune` 微调音符的音高

`start` 、`duration` 指定音符在音频中的位置（单位为秒）

使用 `addZone` 将音符添加到组里，`from` 和 `to` 设置音符覆盖的范围 

```js
// group.addZone(zone, from, to)
group.addZone(zone, 59, 61); // 音符覆盖B4到#C4
```

#### 演奏

立即播放音符C4，长度0.5秒：

```js
// playNote(note, time = 0, duration = 0, velocity = this.dyn)
Piano.playNote(MidiLabCore.utils.note('C4'), 0, 0.5);
// 或者写成 Piano.playNote(60, 0, 0.5);
```

5秒后播放，力度为64

```js
Piano.playNote(60, 5, 0.5, 64);
```

不指定播放长度，需要手动释放：

```js
Piano.playNote(60);
...
Piano.releaseNote(60); // 之后需要释放音符
```