import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { JwtHelperService } from './jwt';
import { WP_CONFIG, WpConfig } from './interfaces';
import { WpAuthRef } from './auth';
import { WpModelRef, WpModelClient } from './model';
import { WpCollectionClient, WpCollectionRef, WpQuery } from './collection';

import { getDefaultWpConfig, mergeDeep } from './utilities/helper';

@Injectable({
  providedIn: 'root'
})
export class WordPress {

  static wp: WordPress = undefined;

  private _errorEmitter = new Subject<Error>();
  error = this._errorEmitter.asObservable();

  auth: WpAuthRef;

  private _config: WpConfig = getDefaultWpConfig(this.platform);
  get config(): WpConfig {
    return this._config;
  }

  constructor(private http: HttpClient,
              private modelHttp: WpModelClient,
              private collectionHttp: WpCollectionClient,
              @Inject(PLATFORM_ID) private platform: Object,
              @Inject(WP_CONFIG) config: WpConfig,
              private jwt: JwtHelperService
  ) {
    // Make WordPress available for decorators
    WordPress.wp = this;

    if (!config.baseUrl) {
      throw new Error(`[WordPressModule]: Please set the baseUrl`);
    }
    // Set WordPress config
    this.setConfig(config);

    // Set JwtModule Config
    this.setJwtConfig();

    // Initialize auth service
    this.auth = new WpAuthRef(this.config, http, this._errorEmitter, jwt);
  }

  /**
   * Create a WpCollectionRef for lists and pagination
   */
  collection(endpoint: string, args: WpQuery): WpCollectionRef {
    return new WpCollectionRef(this.collectionHttp, this.config, endpoint, args, this._errorEmitter);
  }

  /**
   * Create a WpModelRef for CRUD operation
   */
  model(endpoint: string): WpModelRef {
    return new WpModelRef(this.modelHttp, this.config, endpoint, this._errorEmitter);
  }

  /**
   * Set WordPress config
   */
  setConfig(config: WpConfig) {
    this._config = mergeDeep(this.config, config);
  }

  private setJwtConfig() {
    // Get the domain by removing the 'http://' from baseUrl
    const domain = this.config.baseUrl.replace(/(^\w+:|^)\/\//, '');
    this.jwt.setConfig({
      tokenGetter: this.config.jwtOptions.tokenGetter,
      whitelistedDomains: [domain],
      blacklistedRoutes: [domain + this.config.authUrl]
    });
  }
}
