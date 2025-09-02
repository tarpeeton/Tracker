

export const getUnicName = (name: string) => {
  const date = new Date().toLocaleString().split(",")[0]
  const random = Math.floor(Math.random() * 1e6)

  return `${date}_${random}.${name}/rustam_v1`;
}
