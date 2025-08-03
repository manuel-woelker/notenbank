export type Id = string;
export type LocalId = string;

export function makeId(name: string): string {
  return name.replace(/\W+/g, '-')
}

export function findUniqueId<T extends { id: string }>(items: T[], name: string): string {
  function isUnique(id: string): boolean {
    return !items.find(item => item.id === id);
  }

  const base_id = makeId(name);
  if (isUnique(base_id)) {
    return base_id;
  }
  let i = 2;
  while (!isUnique(`${base_id}_${i}`)) {
    i++;
  }
  return `${base_id}_${i}`;
}