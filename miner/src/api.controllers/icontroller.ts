import express, { Router } from 'express';

export interface IController {
    router: Router;
    path: string;
}
