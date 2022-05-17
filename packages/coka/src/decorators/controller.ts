import 'reflect-metadata';
import { interfaces } from 'inversify';
import { Widget } from '../component';

export const ControllerMetadataNameSpace = 'controller';

/**
 * 控制器注解
 * @param path 
 * @returns 
 */
 export const controller = (path: string = '/') => {
  return (target: interfaces.Newable<Widget>) => {
    Reflect.defineMetadata(ControllerMetadataNameSpace, path, target);
  }
}