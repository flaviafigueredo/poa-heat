"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Se o globo quebrar (celular sem WebGL, arquivo JS que não baixou), o erro
// para aqui em vez de derrubar a página inteira. A abertura continua com as
// estrelas e o texto, só sem o globo.
// Precisa ser uma classe: o React só sabe capturar erros de render com os
// métodos de classe abaixo, não existe hook para isso.
export class GlobeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
