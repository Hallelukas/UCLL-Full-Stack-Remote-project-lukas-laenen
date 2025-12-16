import jwt, { SignOptions } from 'jsonwebtoken'

interface JwtPayload {
  username: string
  role: string
}

interface JwtOptions {
  expiresInMs?: number
}

const generateJwtToken = ({ username, role }: JwtPayload, options?: JwtOptions): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing')

  const signOptions: SignOptions = {
    expiresIn: options?.expiresInMs ? `${Math.floor(options.expiresInMs / 1000)}s` : '1h',
    issuer: 'team_app',
    algorithm: 'HS256',
  }

  try {
    return jwt.sign({ username, role }, process.env.JWT_SECRET, signOptions)
  } catch (error) {
    console.error('JWT generation error:', error)
    throw new Error('Error generating JWT token.')
  }
}

const verifyJwt = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}


export { generateJwtToken, verifyJwt }