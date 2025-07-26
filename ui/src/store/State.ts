

export interface Fach {
  name: string,
}


export interface Schüler {
  name: string,
}

export interface State {
  fächer: Fach[],
  schüler: Schüler[],
}