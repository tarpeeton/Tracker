

export const getFormatedDate = (date: string) => {
  const formatedDate = new Date(date).toLocaleDateString('ru-RU')


  return formatedDate
}
