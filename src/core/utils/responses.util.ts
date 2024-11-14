export const successResponse = (results: any = null, message: string = null, others: object = {}) => {
  const object = {
    ok: true,
    results,
    message,
		...others
  }
	// console.log('\n[Response]:', JSON.stringify(object))
	return object;
}

export const errorResponse = (error: any, others: object = {}) => {
	const object = {
		ok: false,
		error,
		...others
	}
	// console.log('\n[Response]:', JSON.stringify(object))
	return object;
}