const hasFields = (obj, ...fields) => {
  const errors = []
  fields.forEach(field => {
    if (!obj.hasOwnProperty(field)) errors.push(field)
  })
  return [errors.length == 0, errors]
}

export default hasFields