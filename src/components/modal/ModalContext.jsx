'use client';

import {createContext, useCallback, useContext, useMemo, useState} from 'react';

const ModalContext = createContext();

export function ModalProvider({children}) {
  // 모달을 큐로 관리한다. 화면에는 항상 맨 앞(queue[0]) 하나만 표시되고,
  // 닫으면 다음 모달이 이어서 나타나므로 여러 모달이 겹치지 않는다.
  const [queue, setQueue] = useState([]);

  const openModal = useCallback(content => {
    setQueue(prev => {
      // key가 지정된 모달은 큐에 같은 key가 이미 있으면 중복으로 쌓지 않는다.
      // (effect 중복 실행, 라우트 반복 진입 등으로 인한 중복 적재 방지)
      if (content?.key != null && prev.some(item => item.key === content.key)) {
        return prev;
      }
      return [...prev, content];
    });
  }, []);

  // 현재(맨 앞) 모달을 닫고 다음 모달로 진행
  const closeModal = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  // 큐에 쌓인 모든 모달을 한 번에 제거
  const closeAllModals = useCallback(() => {
    setQueue([]);
  }, []);

  const modalContent = queue[0] ?? null;
  const isOpen = queue.length > 0;

  const value = useMemo(
    () => ({
      isOpen,
      modalContent,
      openModal,
      closeModal,
      closeAllModals,
      queueLength: queue.length,
    }),
    [isOpen, modalContent, openModal, closeModal, closeAllModals, queue.length],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');

  return context;
};
