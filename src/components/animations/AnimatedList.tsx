/**
 * 列表动画组件模块
 * 
 * 为列表项提供滚动触发的缩放淡入动画效果
 * 支持单个容器及其子元素，或多个独立元素
 * 
 * @module AnimatedList
 */

import React, { ReactNode, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import './AnimatedList.css';

/**
 * 单个动画列表项的属性
 */
interface AnimatedItemProps {
  children: ReactNode;
  index: number;
}

/**
 * 动画列表项组件
 * 当元素滚动进入视口时触发缩放和淡入动画
 * 
 * @param children - 要动画化的子元素
 * @param index - 列表项索引（未使用，保留用于潜在的错开动画）
 */
const AnimatedItem = ({ children, index }: AnimatedItemProps) => {
  const ref = useRef(null);
  // 监听元素是否在视口中，once: false 表示可以重复触发
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ 
        scale: isInView ? 1 : 0.7, 
        opacity: isInView ? 1 : 0 
      }}
      transition={{ 
        duration: 0.2,  // 动画持续时间
        delay: 0.1      // 延迟时间
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 动画列表容器的属性
 */
interface AnimatedListProps {
  children?: ReactNode;
}

/**
 * 动画列表容器组件
 * 
 * 用法：
 * 1. 包裹多个独立元素：<AnimatedList><div>1</div><div>2</div></AnimatedList>
 * 2. 包裹带子元素的容器：<AnimatedList><Grid><Item/><Item/></Grid></AnimatedList>
 * 
 * 第二种用法会保留容器的原有属性（如Grid布局），只对其子元素应用动画
 * 
 * @param children - 要动画化的子元素或包含子元素的容器
 */
const AnimatedList = ({ children }: AnimatedListProps) => {
  if (!children) return null;

  const childArray = React.Children.toArray(children);
  
  if (childArray.length === 1 && React.isValidElement(childArray[0])) {
    const container = childArray[0];
    
    if (container.props.children) {
      const items = React.Children.toArray(container.props.children);
      
      const animatedItems = items.map((item, index) => (
        <AnimatedItem key={index} index={index}>
          {item}
        </AnimatedItem>
      ));
      
      return React.cloneElement(container, {
        ...container.props,
        children: animatedItems
      });
    }
  }
  
  return (
    <>
      {childArray.map((child, index) => (
        <AnimatedItem key={index} index={index}>
          {child}
        </AnimatedItem>
      ))}
    </>
  );
};

export default AnimatedList;
