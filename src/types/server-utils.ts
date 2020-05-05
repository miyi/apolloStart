import { Request,  Response } from 'express'

export interface AddressInfo {
  address: string
  family: string
  port: number
}

export interface ContextIntegration {
  req: Request
  res: Response
}