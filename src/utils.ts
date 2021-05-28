export const groupNullables = <T>(nullables: (null | undefined | T)[]): null | T[] =>
  nullables.reduce((prev: null | T[], nullable: null | undefined | T) => {
    if (! nullable) return prev
    if (! prev) return [nullable]
    prev.push(nullable)
    return prev
  }, null)
