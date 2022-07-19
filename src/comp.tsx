import React, { useEffect, useState } from 'react';
import { injectable } from 'inversify';
import { Component, widget, Widget, TRequest, suspensable } from '../packages/coka/src';
import { createUseAxiosInstance } from '../packages/axios/src';
// import Mathic from './math';
// const Mathic = dynamic(() => import('./math'), <span>loading...</span>);

const axios = createUseAxiosInstance({
  baseURL: typeof window === 'undefined' ? 'http://api.baizhun.cn/micro/v2' : '/micro/v2'
})

axios.instance.interceptors.response.use(response => {
  if (response.data.status !== 200) {
    throw new Error(response.data.error);
  }
  response.data = response.data.data;
  return response;
})

@widget
@injectable()
export default class DemoExample extends Component implements Widget<TRequest> {
  private readonly types: string[] = ['日榜', '周榜', '月榜']
  private readonly values: string[] = ['day', 'week', 'month']
  @suspensable(<span style={{ color: 'red' }}>loading</span>)
  public render() {
    const [type, setType] = useState(0);
    const { data, error, execute, fetched } = axios.useRequest<any[]>({
      abortable: true,
      url: '/live/live/rank/list/finder_auth1_rank',
      id: 'list',
      method: 'get',
      params: {
        period: this.values[type]
      }
    })
    const [value, setValue] = useState(data?.length ? data[0].id : null)
    useEffect(() => {
      execute();
    }, [type])
    useEffect(() => {
      const a = data?.length ? data[0].id : null;
      setValue(a);
    }, [data])
    console.log(value)
    return <div>
      <p onClick={() => this.redirect('/t')}>error: {error}</p>
      <div>
          {
            this.types.map((v, i) => {
              const active = i === type;
              return <div style={{ 
                marginRight: 10, 
                backgroundColor: active ? 'red' : 'white'
              }} key={i} onClick={() => setType(i)}>{v}</div>
            })
          }
      </div>
      <div>
        <select value={value} onChange={(e) => {setValue(e.target.value)}}>
          {
            data?.map(d => {
              return <option value={d.id} key={d.id}>{d.insertTime}</option>
            })
          }
        </select>
      </div>
    </div>  
  }
}