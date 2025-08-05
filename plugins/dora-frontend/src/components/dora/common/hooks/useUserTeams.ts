import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { UserEntity } from '@backstage/catalog-model';


export interface TeamInfo {
  name: string;
  entityRef: string;
}

export function useUserTeams() {
  const catalogApi = useApi(catalogApiRef);

  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        setLoading(true);

        // const userIdentity = await identityApi.getBackstageIdentity();
        // Get the current user entity - try with default namespace
        const userEntities = await catalogApi.getEntitiesByRefs({entityRefs: ['user:default/user1']});

        // Access the first user entity
        const userEntity = userEntities.items[0] as UserEntity;

        if (!userEntity) {
          throw new Error('No user entity found');
        }

        let userTeams: string[] = [];

        // Extract team information from relations
        if (userEntity?.spec?.memberOf) {
            userTeams = [...userEntity.spec.memberOf];
            }

        setTeams(userTeams);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user teams');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [catalogApi]);

  return {
    teams,
    loading,
    error,
  };
} 