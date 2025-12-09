// src/services/AuthService.ts
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const userPoolId = process.env.AWS_USER_POOL_ID!;
const awsRegion = process.env.AWS_REGION!;
const localJwtSecret = process.env.LOCAL_JWT_SECRET!;

const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});

export class AuthService {
  private issuer = `https://cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}`;

  private getKey(header: JwtHeader, callback: SigningKeyCallback) {
    jwks.getSigningKey(header.kid, (err:any, key:any) => {
      if (err) return callback(err);
      callback(null, key.getPublicKey());
    });
  }

  public async verifyAwsToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey.bind(this), {
        algorithms: ['RS256'],
        issuer: this.issuer
      }, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
  }

  public issueLocalToken(payload: any): string {
    const localPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload['cognito:groups']?.[0] || 'user'
    };

    return jwt.sign(localPayload, localJwtSecret, {
      expiresIn: '2h',
      issuer: 'your-app-name'
    });
  }

  public verifyLocalToken(token: string): any | null {
    try {
      return jwt.verify(token, localJwtSecret);
    } catch {
      return null;
    }
  }
}